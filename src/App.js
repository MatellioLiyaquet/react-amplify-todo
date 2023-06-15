import React, { useState, useEffect } from "react";
import "./App.css";
import "@aws-amplify/ui-react/styles.css";
import { API, Auth, Storage } from "aws-amplify";
import {
  Button,
  Flex,
  Heading,
  Image,
  Text,
  TextField,
  View,
  withAuthenticator,
} from "@aws-amplify/ui-react";
import { listTodos } from "./graphql/queries";
import {
  createTodo as createToDoMutation,
  deleteTodo as deleteToDoMutation,
} from "./graphql/mutations";

const App = ({ signOut }) => {
  const [notes, setNotes] = useState([]);
  const [userId, setUserId] = useState("");
  const [userInfo, setUserInfo] = useState({ attributes: {} });
  const getUserId = async () => {
    try {
      const currentUser = await Auth.currentAuthenticatedUser();
      setUserInfo(currentUser);
      return currentUser.attributes.sub;
    } catch (error) {
      console.log("Error retrieving user ID:", error);
      return null;
    }
  };

  useEffect(() => {
    const fetchUserId = async () => {
      const userId = await getUserId();
      setUserId(userId);
    };

    fetchUserId();
  }, []);

  useEffect(() => {
    if (userId != "") {
      fetchNotes();
    }
  }, [userId]);

  async function fetchNotes() {
    let apiData;
    if (isAdmin()) {
      apiData = await API.graphql({
        query: listTodos,
        variables: {
          filter: {
            usersID: {
              eq: userId,
            },
          },
        },
      });
    }

    if (isSuperAdmin()) {
      apiData = await API.graphql({
        query: listTodos,
      });
    }

    const notesFromAPI = apiData.data.listTodos.items;
    await Promise.all(
      notesFromAPI.map(async (note) => {
        if (note.image) {
          const url = await Storage.get(note.name);
          note.image = url;
        }
        return note;
      })
    );
    setNotes(notesFromAPI);
  }

  async function createNote(event) {
    event.preventDefault();
    const form = new FormData(event.target);
    const image = form.get("image");
    const data = {
      name: form.get("name"),
      description: form.get("description"),
      image: image.name,
      usersID: userId,
    };
    if (!!data.image) await Storage.put(data.name, image);
    await API.graphql({
      query: createToDoMutation,
      variables: { input: data },
    });
    fetchNotes();
    event.target.reset();
  }

  const isSuperAdmin = () => {
    return userInfo.signInUserSession?.accessToken?.payload?.[
      "cognito:groups"
    ].includes("Super_admin");
  };

  const isAdmin = () => {
    return userInfo.signInUserSession?.accessToken?.payload?.[
      "cognito:groups"
    ].includes("Admin");
  };

  async function deleteNote({ id, name }) {
    const newNotes = notes.filter((note) => note.id !== id);
    setNotes(newNotes);
    await Storage.remove(name);
    await API.graphql({
      query: deleteToDoMutation,
      variables: { input: { id } },
    });
  }

  return (
    <>
      <View className="App">
        <Heading level={1}>My Todo App({userInfo.attributes.email})</Heading>
        <View as="form" margin="3rem 0" onSubmit={createNote}>
          <Flex direction="row" justifyContent="center">
            <TextField
              name="name"
              placeholder="Todo"
              label="Todo"
              labelHidden
              variation="quiet"
              required
            />
            <TextField
              name="description"
              placeholder="Todo Description"
              label="Todo Description"
              labelHidden
              variation="quiet"
              required
            />
            <View
              name="image"
              as="input"
              type="file"
              style={{ alignSelf: "end" }}
            />
            {isSuperAdmin() || isAdmin() ? (
              <Button type="submit">Create Todo</Button>
            ) : (
              ""
            )}
          </Flex>
        </View>
        <Heading level={2}>Current Todos</Heading>
        <View margin="3rem 0">
          {notes.map((note) => (
            <Flex
              key={note.id || note.name}
              direction="row"
              justifyContent="center"
              alignItems="center"
            >
              <Text as="strong" fontWeight={700}>
                {note.name}
              </Text>
              <Text as="span">{note.description}</Text>
              {note.image && (
                <Image
                  src={note.image}
                  alt={`visual aid for ${notes.name}`}
                  style={{ width: 400 }}
                />
              )}
              {isSuperAdmin() ? (
                <Button onClick={() => deleteNote(note)}>
                  Delete {note.usersID === userId ? "my" : ""} todo
                </Button>
              ) : (
                ""
              )}
            </Flex>
          ))}
        </View>
        <Button onClick={signOut}>Sign Out</Button>
        {/* <UserCreateForm key={'123'} /> */}
      </View>
    </>
  );
};

export default withAuthenticator(App);
