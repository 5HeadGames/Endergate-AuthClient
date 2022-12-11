import axios from "axios";
import Web3 from "web3";
import { useState, useEffect } from "react";
import { Magic } from "magic-sdk";
import { ConnectExtension } from "@magic-ext/connect";
import "./styles.css";

const magic = new Magic("pk_live_F1CF688B682EE2CE", {
  network: "goerli",
  locale: "en_US",
  extensions: [new ConnectExtension()],
} as any);

const web3 = new Web3(magic.rpcProvider);

export default function App() {
  const [account, setAccount] = useState(null);
  const [isRejected, setIsRejected] = useState(false);

  useEffect(() => {
    const onPageLoad = () => {
      login();
    };

    // Check if the page has already loaded
    if (document.readyState === "complete") {
      onPageLoad();
    } else {
      window.addEventListener("load", onPageLoad);
      // Remove the event listener when component unmounts
      return () => window.removeEventListener("load", onPageLoad);
    }
  }, []);

  const login = async () => {
    web3.eth
      .getAccounts()
      .then(async (accounts) => {
        const params = new URLSearchParams(window.location.search);
        let platform = params.get("platform");
        let version = params.get("version");
        let uuid = params.get("uuid");
        let wallet = accounts?.[0];
        axios
          .post("http://localhost:3002/auth", {
            platform,
            version,
            uuid,
            wallet,
          })
          .then((response) => {
            setAccount(accounts?.[0]);
          });
      })
      .catch((error) => {
        setIsRejected(true);
        console.log(error);
      });
  };

  const signMessage = async () => {
    const publicAddress = (await web3.eth.getAccounts())[0];
    const signedMessage = await web3.eth.personal
      .sign("My Message", publicAddress, "")
      .catch((e) => console.log(e));

    console.log(signedMessage);
  };

  const showWallet = () => {
    magic.connect.showWallet().catch((e) => {
      console.log(e);
    });
  };

  const disconnect = async () => {
    await magic.connect.disconnect().catch((e) => {
      console.log(e);
    });
    setAccount(null);
  };

  return (
    <div className="app">
      {!account && (
        <>
          <h2 className="status-text">
            {!isRejected ? "Authenticating..." : "Authenticate Failed"}
          </h2>
          <h2 className="hint-text">
            {!isRejected ? "Please wait..." : "Rejected"}{" "}
          </h2>
        </>
      )}

      {account && (
        <>
          <h2 className="status-text">Authenticated</h2>
          <h2 className="hint-text">
            Now you can close this tab and return to the game.
          </h2>
        </>
      )}

      <img src="/logo_s.png" alt="logo" className="logo"></img>
    </div>
  );
}
