import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState(null);
  const [activeWallet, setActiveWallet] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  
  // Check for wallets on component mount
  useEffect(() => {
    checkForWallets();
    window.addEventListener('load', checkForWallets);
    
    // Some wallets emit events when they're connected/disconnected
    window.addEventListener('walletchange', handleWalletChange);
    
    return () => {
      window.removeEventListener('load', checkForWallets);
      window.removeEventListener('walletchange', handleWalletChange);
    };
  }, []);
  
  const checkForWallets = () => {
    console.log("Checking for wallets...");
    // Log all window properties to help debug
    console.log("Available window objects:", Object.keys(window));
    
    // Check for specific wallet objects
    if (window.leo) console.log("Leo wallet detected");
    if (window.foxwallet) console.log("Fox wallet detected");
    if (window.puzzle) console.log("Puzzle wallet detected");
    if (window.soter) console.log("Soter wallet detected");
    
    // Additional checks for Aleo-specific objects
    if (window.aleo) console.log("Generic Aleo wallet detected");
  };
  
  const handleWalletChange = (event) => {
    console.log("Wallet change event detected", event);
    checkWalletConnection();
  };
  
  const checkWalletConnection = async () => {
    try {
      // Check each wallet provider
      if (window.leo && await window.leo.isConnected()) {
        setActiveWallet('leo');
        setIsConnected(true);
        const address = await window.leo.getAccount();
        setAccount(address);
        return true;
      } 
      
      if (window.foxwallet && await window.foxwallet.isConnected()) {
        setActiveWallet('foxwallet');
        setIsConnected(true);
        const address = await window.foxwallet.getAccount();
        setAccount(address);
        return true;
      }
      
      if (window.puzzle && await window.puzzle.isConnected()) {
        setActiveWallet('puzzle');
        setIsConnected(true);
        const address = await window.puzzle.getAccount();
        setAccount(address);
        return true;
      }
      
      if (window.soter && await window.soter.isConnected()) {
        setActiveWallet('soter');
        setIsConnected(true);
        const address = await window.soter.getAccount();
        setAccount(address);
        return true;
      }
      
      // Generic Aleo wallet check
      if (window.aleo && await window.aleo.isConnected()) {
        setActiveWallet('aleo');
        setIsConnected(true);
        const address = await window.aleo.getAccount();
        setAccount(address);
        return true;
      }
      
      return false;
    } catch (err) {
      console.error("Error checking wallet connection:", err);
      return false;
    }
  };
  
  const connectWallet = async (walletType) => {
    setIsConnecting(true);
    setError(null);
    
    try {
      console.log(`Attempting to connect to ${walletType} wallet`);
      
      let walletProvider;
      switch (walletType) {
        case 'leo':
          walletProvider = window.leo;
          break;
        case 'fox':
          walletProvider = window.foxwallet;
          break;
        case 'puzzle':
          walletProvider = window.puzzle;
          break;
        case 'soter':
          walletProvider = window.soter;
          break;
        case 'aleo':
          walletProvider = window.aleo;
          break;
        default:
          throw new Error(`Unknown wallet type: ${walletType}`);
      }
      
      if (!walletProvider) {
        throw new Error(`${walletType} wallet not found. Please install the extension.`);
      }
      
      // Try different connection methods that wallets might implement
      if (walletProvider.connect) {
        await walletProvider.connect();
      } else if (walletProvider.requestAccounts) {
        await walletProvider.requestAccounts();
      } else if (walletProvider.enable) {
        await walletProvider.enable();
      } else {
        throw new Error(`Cannot find a connection method for ${walletType} wallet`);
      }
      
      // Get account
      let address;
      if (walletProvider.getAccount) {
        address = await walletProvider.getAccount();
      } else if (walletProvider.getAddress) {
        address = await walletProvider.getAddress();
      } else if (walletProvider.accounts && Array.isArray(walletProvider.accounts)) {
        address = walletProvider.accounts[0];
      } else {
        console.warn(`Cannot retrieve account from ${walletType} wallet`);
      }
      
      setActiveWallet(walletType);
      setIsConnected(true);
      setAccount(address);
      
    } catch (err) {
      console.error(`Failed to connect to ${walletType} wallet:`, err);
      setError(err.message || `Failed to connect to ${walletType} wallet`);
    } finally {
      setIsConnecting(false);
    }
  };
  
  const disconnectWallet = async () => {
    if (!activeWallet) return;
    
    try {
      let walletProvider;
      switch (activeWallet) {
        case 'leo':
          walletProvider = window.leo;
          break;
        case 'fox':
          walletProvider = window.foxwallet;
          break;
        case 'puzzle':
          walletProvider = window.puzzle;
          break;
        case 'soter':
          walletProvider = window.soter;
          break;
        case 'aleo':
          walletProvider = window.aleo;
          break;
      }
      
      if (walletProvider) {
        if (walletProvider.disconnect) {
          await walletProvider.disconnect();
        } else if (walletProvider.logout) {
          await walletProvider.logout();
        }
      }
      
      setActiveWallet(null);
      setIsConnected(false);
      setAccount(null);
      
    } catch (err) {
      console.error('Error disconnecting wallet:', err);
    }
  };
  
  const getWalletDisplayName = (type) => {
    switch (type) {
      case 'leo': return 'Leo Wallet';
      case 'fox': return 'Fox Wallet';
      case 'puzzle': return 'Puzzle Wallet';
      case 'soter': return 'Soter Wallet';
      case 'aleo': return 'Aleo Wallet';
      default: return type ? `${type.charAt(0).toUpperCase()}${type.slice(1)} Wallet` : 'Unknown Wallet';
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Aleo Wallet Integration</h1>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        {!isConnected ? (
          <div className="wallet-buttons-container">
            <p>Select a wallet to connect:</p>
            
            <button 
              className="wallet-button"
              onClick={() => connectWallet('leo')}
              disabled={isConnecting}
            >
              Connect Leo Wallet
            </button>
            
            <button 
              className="wallet-button"
              onClick={() => connectWallet('fox')}
              disabled={isConnecting}
            >
              Connect Fox Wallet
            </button>
            
            <button 
              className="wallet-button"
              onClick={() => connectWallet('puzzle')}
              disabled={isConnecting}
            >
              Connect Puzzle Wallet
            </button>
            
            <button 
              className="wallet-button"
              onClick={() => connectWallet('soter')}
              disabled={isConnecting}
            >
              Connect Soter Wallet
            </button>
            
            {isConnecting && <p>Connecting... Please check your wallet extension for prompts.</p>}
          </div>
        ) : (
          <div className="wallet-info">
            <p>
              <strong>Connected to:</strong> {getWalletDisplayName(activeWallet)}
            </p>
            {account && (
              <p>
                <strong>Account:</strong> {account.length > 10 ? `${account.slice(0, 6)}...${account.slice(-4)}` : account}
              </p>
            )}
            <button 
              className="wallet-button disconnect-button"
              onClick={disconnectWallet}
            >
              Disconnect Wallet
            </button>
          </div>
        )}
        
        <div className="debug-info">
          <p>If you're having trouble connecting, please make sure:</p>
          <ol>
            <li>You have the wallet extension installed</li>
            <li>The wallet extension is unlocked</li>
            <li>You've refreshed the page after installing the extension</li>
          </ol>
        </div>
      </header>
    </div>
  );
}

export default App;