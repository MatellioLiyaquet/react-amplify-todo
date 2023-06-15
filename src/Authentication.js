import React from "react";
import "./App.css";
import "@aws-amplify/ui-react/styles.css";

import { Authenticator, ThemeProvider, useTheme } from "@aws-amplify/ui-react";
import App from "./App";

const Authentication = ({ signOut }) => {
  const { tokens } = useTheme();
  const theme = {
    name: "Auth Theme",
    tokens: {
      colors: {
        background: {
          primary: {
            value: tokens.colors.neutral["90"].value,
          },
          secondary: {
            value: tokens.colors.neutral["100"].value,
          },
        },
        font: {
          interactive: {
            value: tokens.colors.white.value,
          },
        },
        brand: {
          primary: {
            10: tokens.colors.teal["100"],
            80: tokens.colors.teal["40"],
            90: tokens.colors.teal["20"],
            100: tokens.colors.teal["10"],
          },
        },
      },
      components: {
        tabs: {
          item: {
            _focus: {
              color: {
                value: tokens.colors.white.value,
              },
            },
            _hover: {
              color: {
                value: tokens.colors.yellow["80"].value,
              },
            },
            _active: {
              color: {
                value: tokens.colors.white.value,
              },
            },
          },
        },
      },
    },
  };

  return (
    <>
      <ThemeProvider theme={theme}>
        <Authenticator>
          <App />
        </Authenticator>
      </ThemeProvider>
    </>
  );
};

export default Authentication;
