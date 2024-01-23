import './App.css';
import { useSession, useSupabaseClient, useSessionContext } from '@supabase/auth-helpers-react';
import DateTimePicker from 'react-datetime-picker';
import { useState } from 'react';
import emailjs, { init } from "@emailjs/browser";
import React, { useRef,useEffect } from "react";
import useDrivePicker from 'react-google-drive-picker';

function App() {
  const [openPicker, data, authResponse] = useDrivePicker()

  const handleOpenPicker = () => {
    openPicker({
      clientId:"400842379043-0c6527998gas8tsleeoe09iumitlneda.apps.googleusercontent.com",
      developerKey:"AIzaSyBdfrZF8-bK7deGUeVTbClBnIfxrA8XdS0",
      viewId:"DOCS",
      token:"ya29.a0AfB_byBfvdg2IPURJUGO67PJgsfDanHRTcIwoOiP7i7NY3TITTmy7XklwSqqsLT96xHVNUVAgxJ5cXshUOPlRKnuuiz_niyWdm9MKDkGK0CPcbMoJyKupa96fU0CKpUOU2n2RJLBpcgc_gD-nGRZBU1tG20829M28bgJaCgYKAdYSARISFQHGX2MioXfDknqaFvIc6As9i7wp7g0171",
      showUploadFolders:true,
      showUploadView:true,
      supportDrives:true,
      multiselect:true
    })
  }
   useEffect(() =>{
    if (data) {
       data.docs.map((i) => console.log(i))
    }
    }, [data])
  // Google mail
  init("w3DmNuS6M9nclj2yi");
  const form = useRef();

  const handleSubmit = (e) => {
    e.preventDefault();
    emailjs
      .sendForm(
        "service_1t2ul3g",
        "template_1uy4wh9",
        form.current,
        "w3DmNuS6M9nclj2yi"
      )
      .then(
        (result) => {
          alert("Message Sent Successfully");
          console.log(result.text);
        },
        (error) => {
          console.log(error.text);
        }
      );
  };
  // Google calander:
  const [ start, setStart ] = useState(new Date());
  const [ end, setEnd ] = useState(new Date());
  const [ eventName, setEventName ] = useState("");
  const [ eventDescription, setEventDescription ] = useState("");

  const session = useSession(); // tokens, when session exists we have a user
  const supabase = useSupabaseClient(); // talk to supabase!
  const { isLoading } = useSessionContext();
  
  if(isLoading) {
    return <></>
  }

  async function googleSignIn() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        scopes: 'https://www.googleapis.com/auth/calendar'
      }
    });
    if(error) {
      alert("Error logging in to Google provider with Supabase");
      console.log(error);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  async function createCalendarEvent() {
    console.log("Creating calendar event");
    const event = {
      'summary': eventName,
      'description': eventDescription,
      'start': {
        'dateTime': start.toISOString(), // Date.toISOString() ->
        'timeZone': Intl.DateTimeFormat().resolvedOptions().timeZone // America/Los_Angeles
      },
      'end': {
        'dateTime': end.toISOString(), // Date.toISOString() ->
        'timeZone': Intl.DateTimeFormat().resolvedOptions().timeZone // America/Los_Angeles
      }
    }
    await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
      method: "POST",
      headers: {
        'Authorization':'Bearer ' + session.provider_token // Access token for google
      },
      body: JSON.stringify(event)
    }).then((data) => {
      return data.json();
    }).then((data) => {
      console.log(data);
      alert("Event created, check your Google Calendar!");
    });
  }

  console.log(session);
  console.log(start);
  console.log(eventName);
  console.log(eventDescription);
  return (
    <div className="App">
      <div style={{width: "400px", margin: "30px auto"}}>
        {session ?
          <>
            <form onSubmit={handleSubmit} ref={form}>
        <h1 className="text-center">Email Form</h1>
        <div className="form-row">
          <div className="form-group col-md-6">
            <label htmlFor="First Name">First Name</label>
            <input type="text" className="form-control" name="firstname" />
          </div>
          <div className="form-group col-md-6">
            <label htmlFor="Last Name">Last Name</label>
            <input type="text" className="form-control" name="lastname" />
          </div>
          <div className="form-group col-md-6">
          <label htmlFor="Time">Time: </label>
            <input type="text" className="form-control" name="time" />
          </div>
          <div className="form-group col-md-6">
          <label htmlFor="Date">Date: </label>
            <input type="text" className="form-control" name="date" />
          </div>
          <div className="form-group col-md-6">
            <label htmlFor="message">message</label>
            <textarea
              type="text"
              className="form-control"
              id="inputmessage4"
              name="user_message"
            />
          </div>
        </div>

        <button type="submit" className="btn btn-primary">
          Send
        </button>
        {/* Google drive: */}
        <div><button onClick={() => handleOpenPicker()}>Open Picker</button></div>   
        {/* Google calendar: */}
      </form>
            <h2>Hey there {session.user.email}</h2>
            <p>Start of your event</p>
            <DateTimePicker onChange={setStart} value={start} />
            <p>End of your event</p>
            <DateTimePicker onChange={setEnd} value={end} />
            <p>Event name</p>
            <input type="text" onChange={(e) => setEventName(e.target.value)}/>
            <p>Event description</p>
            <input type="text" onChange={(e) => setEventDescription(e.target.value)}/>
            <hr />
            <button onClick={() => createCalendarEvent()}>Create Calendar Event</button>
            <p></p>
            <button onClick={() => signOut()}>Sign Out</button>
          </>
          :
          <>
            <button onClick={() => googleSignIn()}>Sign In With Google</button>
          </>
        }
      </div>
    </div>
  );
}

export default App;
