import { ConnectExtension } from "@magic-ext/connect";
import axios from "axios";
import { Magic } from "magic-sdk";
import { useEffect, useState } from "react";
import Web3 from "web3";

import { AUTH_URI } from "./config/uri";
import "./styles.css";

const magic = new Magic("pk_live_F2F3382B69E1E50D", {
  network: {
    rpcUrl: "https://polygon-rpc.com/",
    chainId: 137,
  },
  locale: "en_US",
  extensions: [new ConnectExtension()],
} as any);

let web3: Web3;

magic.wallet.getProvider().then((provider) => {
  web3 = new Web3(provider);
});

export default function App() {
  const [account, setAccount] = useState<string | null>(null);
  const [isRejected, setIsRejected] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    // disconnect();

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
    await magic.wallet.connectWithUI();

    web3.eth
      .getAccounts()
      .then(async (accounts) => {
        const params = new URLSearchParams(window.location.search);
        let platform = params.get("platform");
        let version = params.get("version");
        let uuid = params.get("uuid");
        let wallet = accounts?.[0];
        let signMsg = "Endersgate Magic link Authentication: " + uuid;

        web3.eth.personal
          .sign(signMsg, wallet, "")
          .then((sign) => {
            console.log(sign);
            axios
              .post(AUTH_URI, {
                platform,
                version,
                uuid,
                wallet,
                sign,
                signMsg,
              })
              .then((res) => {
                setAccount(accounts?.[0]);
                setIsFinished(true);
                disconnect();
              });
          })
          .catch((e) => console.log(e));
      })
      .catch((error) => {
        setIsRejected(true);
        console.log(error);
      });
  };

  const disconnect = async () => {
    magic.wallet.disconnect().then(() => {
      setAccount(null);
    });
  };

  return (
    <div className="app">
      {!account && !isFinished && (
        <>
          <h2 className="status-text">
            {!isRejected ? "Authenticating..." : "Authenticate Failed"}
          </h2>
          <h2 className="hint-text">
            {!isRejected ? "Please wait..." : "Rejected"}{" "}
          </h2>
        </>
      )}

      {isFinished && (
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
