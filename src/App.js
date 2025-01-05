import React, { useState, useEffect } from "react";
import axios from "axios";

const DATA_URL = "https://yujungfunctiontesting.azurewebsites.net/api/data";
const UPDATE_URL = "https://yujungfunctiontesting.azurewebsites.net/api/update";
const INSERT_URL = "https://yujungfunctiontesting.azurewebsites.net/api/insert"; // Add endpoint for insertion

function App() {
  const [data, setData] = useState([]);
  const [updateStatus, setUpdateStatus] = useState("");
  const [error, setError] = useState("");
  const [selectedJobId, setSelectedJobId] = useState("");
  const [selectedColumn, setSelectedColumn] = useState("");
  const [newValue, setNewValue] = useState("");


  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    axios
      .get(DATA_URL)
      .then((response) => {
        setData(response.data);
        setError("");
      })
      .catch((error) => {
        console.error("There was an error fetching the data:", error);
        setError("Failed to load data. Please try again later.");
      });
  };

  const handlePostRequest = () => {
    if (!selectedJobId || !selectedColumn || !validateInput()) {
      setUpdateStatus("Invalid input. Please correct the errors.");
      return;
    }

    const update_requestBody = {
      JobId: parseInt(selectedJobId, 10),
      column: selectedColumn,
      value: newValue,
    };

    axios
      .post(UPDATE_URL, update_requestBody)
      .then((response) => {
        console.log("POST request successful:", response.data);
        setUpdateStatus("Update successful. Refreshing data...");
        setSelectedJobId("");
        setSelectedColumn("");
        setNewValue("");
        setTimeout(fetchData, 1000);
      })
      .catch((error) => {
        console.error("There was an error in the POST request:", error);
        setUpdateStatus("Update failed. Please check the console for details.");
      });
  };


  const [newJob, setNewJob] = useState({
    StartDate: "",
    StartHour: "",
    Name: "",
    Description: "",
    IsActive: "",
  });

  const handleInsertJob = () => {
    axios
      .post(INSERT_URL, newJob)
      .then((response) => {
        console.log("Insert successful:", response.data);
        setUpdateStatus("Job inserted successfully. Refreshing data...");
        setNewJob({ StartDate: "", StartHour: "", Name: "", Description: "", IsActive: "" });
        setTimeout(fetchData, 1000);
      })
      .catch((error) => {
        console.error("Error inserting job:", error);
        setUpdateStatus("Job insertion failed. Please check the console for details.");
      });
  };

  const validateInput = () => {
    switch (selectedColumn) {
      case "JobId":
        return /^[0-9]+$/.test(newValue); // Numbers only
      case "StartDate":
        return /^\d{4}-\d{2}-\d{2}$/.test(newValue); // YYYY-MM-DD format
      case "StartHour":
        return /^\d{2}:\d{2}:\d{2}$/.test(newValue); // HH:MM:SS format
      case "Name":
      case "Description":
        return newValue.length > 0 && newValue.length <= 100; // Text length check
      case "IsActive":
        return newValue === "1" || newValue === "0"; // Only "1" or "0"
      default:
        return false;
    }
  };

  const getLegend = () => {
    return (
      <div
      style={{
        margin: "80px",
        padding: "15px",
        border: "2px solid",
        maxWidth: "300px", 
        maxHeight: "200px",
        overflowY: "auto",
      }}
    >
        <h3>Legend</h3>
        <ul>
          <li>JobId: Integer</li>
          <li>StartDate: Date</li>
          <li>StartHour: HH:MM:SS</li>
          <li>Name: text</li>
          <li>Description: Text</li>
          <li>IsActive: 1 or 0</li>
        </ul>
      </div>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "row" }}>
      <div>
        <h1>Jobs from Azure SQL</h1>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <table border="1">
          <thead>
            <tr>
              <th>JobId</th>
              <th>StartDate</th>
              <th>StartHour</th>
              <th>Name</th>
              <th>Description</th>
              <th>IsActive</th>
            </tr>
          </thead>
          <tbody>
            {data.map((job) => (
              <tr key={job.JobId}>
                <td>{job.JobId}</td>
                <td>{job.StartDate}</td>
                <td>{job.StartHour}</td>
                <td>{job.Name}</td>
                <td>{job.Description || null}</td>
                <td>{job.IsActive ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <br />
        {updateStatus && (
          <p style={{ fontWeight: "bold",  
                      textDecoration: "underline",
                      fontSize: "20px",
                    }}>
            {updateStatus}
          </p>
        )}
        <div>
          <h3>Update Job Data</h3>
          <label>
            Job ID:
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
            >
              <option value="" disabled>
                Job ID
              </option>
              {data.map((job) => (
                <option key={job.JobId} value={job.JobId}>
                  {job.JobId}
                </option>
              ))}
            </select>
          </label>

          <label>
            Column:
            <select
              value={selectedColumn}
              onChange={(e) => setSelectedColumn(e.target.value)}
            >
              <option value="" disabled>
                Select Column
              </option>
              <option value="Name">Name</option>
              <option value="StartDate">StartDate</option>
              <option value="StartHour">StartHour</option>
              <option value="Description">Description</option>
              <option value="IsActive">IsActive</option>
            </select>
          </label>

          <label>
            Enter New Value:
            <input
              type="text"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
            />
          </label>

          <button onClick={handlePostRequest}>Update</button>

        </div>
        <br />
        <div>
          <h3>Insert New Job</h3>
          <table style={{ borderCollapse: "collapse" }}>
            <tbody>
              <tr>
                <td><label>Start Date:</label></td>
                <td>
                  <input
                    type="date"
                    value={newJob.StartDate}
                    onChange={(e) => setNewJob({ ...newJob, StartDate: e.target.value })}
                  />
                </td>
              </tr>
              <tr>
                <td><label>Start Hour:</label></td>
                <td>
                  <input
                    type="time"
                    value={newJob.StartHour}
                    onChange={(e) => setNewJob({ ...newJob, StartHour: e.target.value })}
                  />
                </td>
              </tr>
              <tr>
                <td><label>Name:</label></td>
                <td>
                  <input
                    type="text"
                    value={newJob.Name}
                    onChange={(e) => setNewJob({ ...newJob, Name: e.target.value })}
                  />
                </td>
              </tr>
              <tr>
                <td><label>Description:</label></td>
                <td>
                  <input
                    type="text"
                    value={newJob.Description}
                    onChange={(e) => setNewJob({ ...newJob, Description: e.target.value })}
                  />
                </td>
              </tr>
              <tr>
                <td><label>Is Active:</label></td>
                <td>
                  <select
                    value={newJob.IsActive}
                    onChange={(e) => setNewJob({ ...newJob, IsActive: e.target.value })}
                  >
                    <option value="">Select</option>
                    <option value="1">Yes</option>
                    <option value="0">No</option>
                  </select>
                </td>
              </tr>
            </tbody>
          </table>
          <button onClick={handleInsertJob}>Insert Job</button>
        </div>
      </div>
      {getLegend()}
    </div>
  );
}

export default App;
