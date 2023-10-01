import { useState, useEffect } from "react";
import React from "react";
import client, {
  databases,
  DATABASE_ID,
  COLLECTION_ID_MESSAGES,
} from "../appwriteConfig";
import { ID, Query, Role, Permission } from "appwrite";
import { Trash2 } from "react-feather";
import Header from "../components/Header";
import { useAuth } from "../utils/AuthContext";

const Room = () => {
  const { user } = useAuth();

  const [messages, setMessages] = useState([]);
  const [messageBody, setMessageBody] = useState("");

  useEffect(() => {
    getMessages();

    const unsubscribe = client.subscribe(
      `databases.${DATABASE_ID}.collections.${COLLECTION_ID_MESSAGES}.documents`,
      (response) => {
        // Callback will be executed on changes for documents A and all files.
        console.log("realtime", response);

        if (
          response.events.includes(
            "databases.*.collections.*.documents.*.create"
          )
        ) {
          console.log("a message was created");
          setMessages((prevState) => [response.payload, ...prevState]);
        }

        if (
          response.events.includes(
            "databases.*.collections.*.documents.*.delete"
          )
        ) {
          console.log("a message was deleted");
          setMessages((prevState) =>
            messages.filter((message) => message.$id != response.payload.$id)
          );
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    let payload = {
      user_id: user.$id,
      body: messageBody,
      username: user.name,
    };

    // const user_id = e.target.value

    let permissions = [
      Permission.write(Role.user(user.$id))
    ]

    let response = await databases.createDocument(
      "6516db9f04b569c55a81",
      "6516dbac3f49cc67c7af",
      ID.unique(),
      //   user_id,
      payload,
      permissions
    );

    // console.log('created', ...messageBody)

    // setMessages(prevState => [response, ...messages])

    setMessageBody("");
    location.reload();
  };

  const getMessages = async () => {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTION_ID_MESSAGES,
      [Query.orderDesc("$createdAt"), Query.limit(20)]
    );
    console.log("RESPONSE: ", response.documents);
    setMessages(response.documents);
  };

  const deleteMessage = async (message_id) => {
    databases.deleteDocument(DATABASE_ID, COLLECTION_ID_MESSAGES, message_id);
    // setMessages(prevState => messages.filter(message => message.$id != message_id))
  };

  return (
    <main className="container">
      <Header />
      <div className="room--container">
        <form id="message-form" onSubmit={handleSubmit}>
          <div>
            <textarea
              required
              maxLength="1000"
              placeholder="Say something..."
              value={messageBody}
              onChange={(e) => {
                console.log("key is ",e.key);
                setMessageBody(e.target.value);
                
              }}
            ></textarea>
          </div>

          <div className="send-btn--wrapper">
            <input type="submit" value="Send" className="btn btn--secondary" />
          </div>
        </form>

        <div>
          {messages.map((message) => (
            <div key={message.$id} className="message--wrapper">
              <div className="message--header">
                <p>
                  {message?.username ? (
                    <span>{message.username}</span>
                  ) : (
                    <span>Anonymous User</span>
                  )}
                  <small className="message-timestamp">
                    {new Date(message.$createdAt).toLocaleString()}
                  </small>
                </p>

                <Trash2
                  className="delete--btn"
                  onClick={() => {
                    deleteMessage(message.$id);
                  }}
                />
              </div>

              <div className="message--body">
                <span>{message.body}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default Room;
