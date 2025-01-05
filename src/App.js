import React, { useState, useEffect } from "react";
import axios from "axios";

const DATA_URL = "https://yujungfunctiontesting.azurewebsites.net/api/data";
const UPDATE_URL = "https://yujungfunctiontesting.azurewebsites.net/api/update";
const INSERT_URL = "https://yujungfunctiontesting.azurewebsites.net/api/insert";

function App() {
  const [data, setData] = useState([]);
  const [updateStatus, setUpdateStatus] = useState("");
  const [error, setError] = useState("");
  const [selectedJobId, setSelectedJobId] = useState("");
  const [selectedColumn, setSelectedColumn] = useState("");
  const [newValue, setNewValue] = useState("");
  const [newJob, setNewJob] = useState({
    StartDate: "",
    StartHour: "",
    Name: "",
    Description: "",
    IsActive: "",
  });

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
        logError("Error fetching data", error);
        setError("Failed to load data. Please try again later.");
      });
  };

  const handlePostRequest = () => {
    if (!selectedJobId || !selectedColumn || !validateInput()) {
      setUpdateStatus("Invalid input. Please correct the errors.");
      return;
    }

    const updateRequestBody = {
      JobId: parseInt(selectedJobId, 10),
      column: selectedColumn,
      value: newValue,
    };

    axios
      .post(UPDATE_URL, updateRequestBody)
      .then((response) => {
        console.log("POST request successful:", response.data);
        setUpdateStatus("Update successful. Refreshing data...");
        clearUpdateFields();
        setTimeout(fetchData, 1000);
      })
      .catch((error) => {
        logError("Error in POST request", error);
        setUpdateStatus("Update failed. Please check the error details.");
      });
  };

  const handleInsertJob = () => {
    axios
      .post(INSERT_URL, newJob)
      .then((response) => {
        console.log("Insert successful:", response.data);
        setUpdateStatus("Job inserted successfully. Refreshing data...");
        resetNewJob();
        setTimeout(fetchData, 1000);
      })
      .catch((error) => {
        logError("Error inserting job", error);
        setUpdateStatus("Job insertion failed. Please check the error details.");
      });
  };

  const validateInput = () => {
    switch (selectedColumn) {
      case "JobId":
        return /^[0-9]+$/.test(newValue);
      case "StartDate":
        return /^\d{4}-\d{2}-\d{2}$/.test(newValue);
      case "StartHour":
        return /^\d{2}:\d{2}:\d{2}$/.test(newValue);
      case "Name":
      case "Description":
        return newValue.length > 0 && newValue.length <= 100;
      case "IsActive":
        return newValue === "1" || newValue === "0";
      default:
        return false;
    }
  };

  const clearUpdateFields = () => {
    setSelectedJobId("");
    setSelectedColumn("");
    setNewValue("");
  };

  const resetNewJob = () => {
    setNewJob({ StartDate: "", StartHour: "", Name: "", Description: "", IsActive: "" });
  };

  const logError = (context, error) => {
    console.error(`${context}:`, error);
    const detailedError =
      error.response?.data?.error || error.response?.data || error.message || "Unknown error occurred";
    setError(detailedError);
  };

  return (
    <div style={{ display: "flex", flexDirection: "row" }}>
      <div>
        <h1>Jobs from Azure SQL</h1>

        {error && <p style={{ color: "red" }}>{`Error: ${error}`}</p>}

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
        {updateStatus && <p style={{ fontWeight: "bold" }}>{updateStatus}</p>}

        {/* Update Job Section */}
        <div>
          <h3>Update Job Data</h3>
          <label>
            Job ID:
            <select value={selectedJobId} onChange={(e) => setSelectedJobId(e.target.value)}>
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
            <select value={selectedColumn} onChange={(e) => setSelectedColumn(e.target.value)}>
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
            <input type="text" value={newValue} onChange={(e) => setNewValue(e.target.value)} />
          </label>
          <button onClick={handlePostRequest}>Update</button>
        </div>

        {/* Insert Job Section */}
        <div>
          <h3>Insert New Job</h3>
          <input type="date" value={newJob.StartDate} onChange={(e) => setNewJob({ ...newJob, StartDate: e.target.value })} />
          <input type="time" value={newJob.StartHour} onChange={(e) => setNewJob({ ...newJob, StartHour: e.target.value })} />
          <input type="text" value={newJob.Name} onChange={(e) => setNewJob({ ...newJob, Name: e.target.value })} />
          <input type="text" value={newJob.Description} onChange={(e) => setNewJob({ ...newJob, Description: e.target.value })} />
          <select value={newJob.IsActive} onChange={(e) => setNewJob({ ...newJob, IsActive: e.target.value })}>
            <option value="">Select</option>
            <option value="1">Yes</option>
            <option value="0">No</option>
          </select>
          <button onClick={handleInsertJob}>Insert Job</button>
        </div>
      </div>
    </div>
  );
}

export default App;
