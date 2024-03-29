import { useEffect, useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import {
  Appearance,
  loadStripe,
  StripeElementsOptions,
} from "@stripe/stripe-js";
import {
  ThirdwebNftMedia,
  useAddress,
  useContract,
  useDisconnect,
  useNFT,
} from "@thirdweb-dev/react";
import { useMagic } from "@thirdweb-dev/react/evm/connectors/magic";
import type { NextPage } from "next";
import Form from "../components/Form";
import { EDITION_ADDRESS } from "../constants/addresses";
import styles from "../styles/Home.module.css";
import TermsAndConditions from "../components/TermsAndConditions";

const Home: NextPage = () => {
  const address = useAddress();
  const connectWithMagic = useMagic();
  const disconnect = useDisconnect();
  const [email, setEmail] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [customerId, setCustomerId] = useState<string>("");
  const { contract } = useContract(EDITION_ADDRESS, "signature-drop");
  const { data: nft, error } = useNFT(contract, 2);
  const [clientSecret, setClientSecret] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const stripe = loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string
  );

  const appearance: Appearance = {
    theme: "night",
    labels: "above",
  };

  const options: StripeElementsOptions = {
    clientSecret,
    appearance,
  };

  useEffect(() => {
    disconnect();
    localStorage.clear();
  }, []);

  useEffect(() => {
    if (address && customerId) {
      // Call /api/stripe_intent
      fetch("/api/stripe_intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address,
          customerId,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          setClientSecret(data.client_secret);
        });

      // Call /api/update_customer
      fetch("/api/update_customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address,
          customerId,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          // You can handle response here, if needed.
        });
    }
  }, [address, customerId]);

  const handleLogin = () => {
    if (firstName && lastName && phoneNumber && email) {
      fetch("/api/create_customer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          lastName,
          phoneNumber,
          email,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.alreadyPurchased) {
            setMessage("This email has already been used for a successful purchase.");
          } else {
            if (data.customerId) {
              setCustomerId(data.customerId);
              connectWithMagic({ email });
            }
          }
        })
        .catch((error) => {
          console.error("Error creating customer:", error);
        });
    }
  };

  const [showTerms, setShowTerms] = useState(true);

  const handleAcceptTerms = () => {
    setShowTerms(false);
  };

  return (
    <div className={styles.container}>
      {showTerms && <TermsAndConditions onAccept={handleAcceptTerms} />}
      {message && <h2>{message}</h2>}
      {!showTerms && address ? (
        <>
          <p>You are signed in as: {email}</p>
          <div className={styles.nftCard}>
            {nft?.metadata && (
              <ThirdwebNftMedia
                metadata={nft?.metadata}
                style={{ width: 300, height: 300 }}
              />
            )}
<p className={`${styles.centeredText}`}>Step into the world of the Reggae Groupies, where soulful beats and positive energy collide, creating a community of like-minded souls, embracing the philosophy of "one love" and spreading positivity like wildfire. Being a Reggae Groupie means immersing yourself in a culture that celebrates freedom, love, and the power of reggae music to heal, uplift spirits, & ignite the dance floor </p>
<p className={`${styles.limitText}`}>LIMITED TO ONE PURCHASE PER EMAIL ADDRESS</p>
            <p>Price: 150$</p>
          </div>
          {clientSecret && (
            <Elements options={options} stripe={stripe}>
              <Form />
            </Elements>
          )}
        </>
      ) : (
        <>
          <h2 style={{ fontSize: "1.3rem" }}>Sign Up With Email</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
            style={{
              width: 500,
              maxWidth: "90vw",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <input
              type="text"
              placeholder="First Name"
              className={styles.inputField}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <input
              type="text"
              placeholder="Last Name"
              className={styles.inputField}
              onChange={(e) => setLastName(e.target.value)}
            />
            <input
              type="text"
              placeholder="Phone Number"
              className={styles.inputField}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
            <input
              type="email"
              placeholder="Your Email Address"
              className={styles.textInput}
              style={{ width: "90%", marginBottom: 0 }}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button className={styles.mainButton}>Sign Up</button>
          </form>
        </>
      )}
    </div>
  );
};

export default Home;
