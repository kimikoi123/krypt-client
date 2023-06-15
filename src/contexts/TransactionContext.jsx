"use client"

import { useEffect, useState, createContext, useContext } from "react"
import { ethers } from "ethers"
import { contractABI, contractAddress } from "../utils/constants"

const TransactionContext = createContext({})

const { ethereum } = window

const createEthereumContract = () => {
  const provider = new ethers.BrowserProvider(ethereum)
  const signer = provider.getSigner()
  const transactionsContract = new ethers.Contract(
    contractAddress,
    contractABI,
    signer
  )

  return transactionsContract
}

export const useTransaction = () => {
  return useContext(TransactionContext)
}

export const TransactionProvider = ({ children }) => {
  const [formData, setformData] = useState({
    addressTo: "",
    amount: "",
    keyword: "",
    message: "",
  })
  const [currentAccount, setCurrentAccount] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [transactionCount, setTransactionCount] = useState(0)

  const handleChange = (e, name) => {
    setformData((prevState) => ({ ...prevState, [name]: e.target.value }))
  }

  const checkIfWalletIsConnect = async () => {
    try {
      if (!ethereum) return alert("Please install MetaMask.")

      const accounts = await ethereum.request({ method: "eth_accounts" })

      if (accounts.length) {
        setCurrentAccount(accounts[0])
        
      } else {
        console.log("No accounts found")
      }
    } catch (error) {
      console.log(error)
    }
  }

  const connectWallet = async () => {
    try {
      if (!ethereum) return alert("Please install MetaMask.")

      const accounts = await ethereum.request({ method: "eth_requestAccounts" })

      setCurrentAccount(accounts[0])
      window.location.reload()
    } catch (error) {
      console.log(error)

      throw new Error("No ethereum object")
    }
  }

  const sendTransaction = async () => {
    try {
      if (ethereum) {
        const { addressTo, amount, keyword, message } = formData
        const transactionsContract = createEthereumContract()
        const parsedAmount = ethers.utils.parseEther(amount)

        await ethereum.request({
          method: "eth_sendTransaction",
          params: [
            {
              from: currentAccount,
              to: addressTo,
              gas: "0x5208",
              value: parsedAmount._hex,
            },
          ],
        })

        const transactionHash = await transactionsContract.addToBlockchain(
          addressTo,
          parsedAmount,
          message,
          keyword
        )

        setIsLoading(true)
        console.log(`Loading - ${transactionHash.hash}`)
        await transactionHash.wait()
        console.log(`Success - ${transactionHash.hash}`)
        setIsLoading(false)

        const transactionsCount =
          await transactionsContract.getTransactionCount()

        setTransactionCount(transactionsCount.toNumber())
        window.location.reload()
      } else {
        console.log("No ethereum object")
      }
    } catch (error) {
      console.log(error)

      throw new Error("No ethereum object")
    }
  }

  useEffect(() => {
    checkIfWalletIsConnect()
  }, [])

  const value = {
    transactionCount,
    connectWallet,
    currentAccount,
    isLoading,
    sendTransaction,
    handleChange,
    formData,
  }

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  )
}
