import React, { useState } from "react";
import Webcam from "react-webcam";
import axios from "axios";
import {
  Container,
  Grid,
  TextField,
  Button,
  Typography,
  Paper,
  Box,
} from "@mui/material";
import { Person, School, Class, Domain, Numbers } from "@mui/icons-material";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";

const AddPerson = () => {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [year, setYear] = useState("");
  const [department, setDepartment] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [imageSrc, setImageSrc] = useState(null);
  const [isCaptured, setIsCaptured] = useState(false); // To toggle between webcam and captured image
  const webcamRef = React.useRef(null);
  const navigate = useNavigate();

  const base64ToFile = (base64, filename) => {
    const [header, data] = base64.split(",");
    const mime = header.match(/:(.*?);/)[1];
    const binary = atob(data);
    const array = [];
    for (let i = 0; i < binary.length; i++) {
      array.push(binary.charCodeAt(i));
    }
    return new File([new Uint8Array(array)], filename, { type: mime });
  };

  const capture = () => {
    if (isCaptured) {
      setIsCaptured(false);
      setImageSrc(null);
    } else {
      const capturedImage = webcamRef.current.getScreenshot();
      setImageSrc(capturedImage);
      setIsCaptured(true);
    }
  };

  const saveDetails = async () => {
    if (!imageSrc) {
      alert("Please capture the face image first!");
      return;
    }

    try {
      const file = base64ToFile(imageSrc, "face_image.jpg");
      const formData = new FormData();
      formData.append("name", name);
      formData.append("age", age);
      formData.append("year", year);
      formData.append("department", department);
      formData.append("roll_no", rollNo);
      formData.append("face_image", file);

      const response = await axios.post(
        "http://localhost:8000/api/add/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      alert("Person details and face image saved successfully!");
      console.log("Response:", response.data);
    } catch (error) {
      console.error("Error saving details:", error);
      alert("Error saving details. Check the console for details.");
    }
  };

  const handleTakeAttendance = () => {
    navigate("/validate-person");
  };

  return (
    <Container maxWidth="lg">
      <Box display="flex" justifyContent="flex-end" mb={0.5} mt={0.5}>
        <Button
          variant="contained"
          style={{
            backgroundColor: "#673ab7",
            color: "white",
            padding: "10px 20px",
          }}
          onClick={handleTakeAttendance}
        >
          Take Attendance
        </Button>
      </Box>
      <Grid container spacing={4} style={{ marginTop: "0px" }}>
        <Grid item xs={12} md={6}>
          <Paper
            elevation={6}
            style={{
              padding: "20px",
              backgroundColor: "#f3f4f6",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <Typography
              variant="h5"
              gutterBottom
              style={{
                color: "#3f51b5",
                marginBottom: "10px", // Reduced the margin below the heading
              }}
            >
              Add Person
            </Typography>
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center" // Centering horizontally and vertically
              style={{ minHeight: "400px", marginTop: "0px" }} // Reduced margin at the top
            >
              {isCaptured ? (
                <img
                  src={imageSrc}
                  alt="Captured"
                  style={{
                    width: "100%",
                    maxWidth: "400px",
                    borderRadius: "10px",
                    border: "3px solid #3f51b5",
                  }}
                />
              ) : (
                <Webcam
                  ref={webcamRef}
                  // mirrored={true}
                  screenshotFormat="image/jpeg"
                  style={{
                    width: "100%",
                    maxWidth: "400px",
                    borderRadius: "10px",
                    border: "3px solid #3f51b5",
                  }}
                />
              )}
              <Typography
                variant="body2"
                style={{
                  marginTop: "10px",
                  color: "#f50057",
                }}
              >
                * Make sure you have good lighting for better recognition.
              </Typography>
              <Button
                variant="contained"
                fullWidth
                style={{
                  marginTop: "20px",
                  backgroundColor: "#3f51b5",
                  color: "white",
                }}
                onClick={capture}
              >
                {isCaptured ? "Recapture" : "Capture Face"}
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper
            elevation={6}
            style={{
              padding: "20px",
              backgroundColor: "#f9fbe7",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <Typography variant="h5" gutterBottom style={{ color: "#388e3c" }}>
              Person Details
            </Typography>
            <TextField
              fullWidth
              label="Name"
              variant="outlined"
              margin="normal"
              value={name}
              onChange={(e) => setName(e.target.value)}
              InputProps={{
                startAdornment: (
                  <Person style={{ marginRight: "8px", color: "#9c27b0" }} />
                ),
              }}
            />
            <TextField
              fullWidth
              label="Age"
              variant="outlined"
              margin="normal"
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              InputProps={{
                startAdornment: (
                  <Numbers style={{ marginRight: "8px", color: "#ff5722" }} />
                ),
              }}
            />
            <TextField
              fullWidth
              label="Year"
              variant="outlined"
              margin="normal"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              InputProps={{
                startAdornment: (
                  <School style={{ marginRight: "8px", color: "#2196f3" }} />
                ),
              }}
            />
            <TextField
              fullWidth
              label="Department"
              variant="outlined"
              margin="normal"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              InputProps={{
                startAdornment: (
                  <Domain style={{ marginRight: "8px", color: "#4caf50" }} />
                ),
              }}
            />
            <TextField
              fullWidth
              label="Roll No"
              variant="outlined"
              margin="normal"
              value={rollNo}
              onChange={(e) => setRollNo(e.target.value)}
              InputProps={{
                startAdornment: (
                  <Class style={{ marginRight: "8px", color: "#ffc107" }} />
                ),
              }}
            />
            <Button
              variant="contained"
              fullWidth
              style={{
                marginTop: "20px",
                backgroundColor: "#ff9800",
                color: "white",
                backgroundColor: "blue",
              }}
              onClick={saveDetails}
            >
              Save Details
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AddPerson;
