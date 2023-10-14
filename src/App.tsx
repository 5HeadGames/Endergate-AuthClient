import axios from "axios";
import Web3 from "web3";
import * as React from 'react';
import { useState, useEffect } from "react";
import { Magic } from "magic-sdk";
import { ConnectExtension } from "@magic-ext/connect";
import "./styles.css";
import magiclogo from "./magiclogo.svg";
import walletconnectlogo from "./walletconnectlogo.png";

import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum'
import { Web3Modal } from '@web3modal/react'
import { configureChains, createConfig, WagmiConfig } from 'wagmi'
import { arbitrum, mainnet, polygon } from 'wagmi/chains'



const chains = [arbitrum, mainnet, polygon]
const projectId = 'b2feb6cd16637e326b4a825b9d6e69cb'

const { publicClient } = configureChains(chains, [w3mProvider({ projectId })])
const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({ projectId, chains }),
  publicClient
});
const ethereumClient = new EthereumClient(wagmiConfig, chains);




const magic = new Magic("pk_live_F1CF688B682EE2CE", {
  network: "goerli",
  locale: "en_US",
  extensions: [new ConnectExtension()],
} as any);



const web3 = new Web3(magic.rpcProvider);



export default function App() {
  const [account, setAccount] = useState(null);
  const [isRejected, setIsRejected] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // disconnect();

    // const onPageLoad = () => {
    //   login();
    // };

    // Check if the page has already loaded
    // if (document.readyState === "complete") {
    //   onPageLoad();
    // } else {
    //   window.addEventListener("load", onPageLoad);
    //   // Remove the event listener when component unmounts
    //   return () => window.removeEventListener("load", onPageLoad);
    // }
  }, []);

  const login = async () => {
    setIsLoading(true); // Show loading circle
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
              .post("https://endersgate-auth-server.herokuapp.com/auth", {
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
                setIsLoading(false); // Hide loading circle
                disconnect();
              });
          })
          .catch((e) => {
            console.log(e);
            setIsLoading(false); // Hide loading circle
          });
      })
      .catch((error) => {
        setIsRejected(true);
        setIsLoading(false); // Hide loading circle
        console.log(error);
      });
  };

  const disconnect = async () => {
    await magic.connect.disconnect().catch((e) => {
      console.log(e);
    });
    setAccount(null);
  };

  const handleMagicConnect = () => {
    login();
  };

 

  return (
    
    <div className="app">
      
      {!account && !isFinished && !isLoading && (
        <>
          <div className="status-text">Authenticate with</div>
          
          <button onClick={handleMagicConnect}>
            Connect with <img src={magiclogo} alt="Magic Logo" className="logo-img" />
          </button>
          <button onClick={handleWalletConnect}>
            Connect with <img src={walletconnectlogo} alt="WalletConnect Logo" className="logo-img" />
          </button>
        </>
      )}

      {isLoading && (
        <div className="loading-circle">
          <div className="loading-circle-inner"></div>
        </div>
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


