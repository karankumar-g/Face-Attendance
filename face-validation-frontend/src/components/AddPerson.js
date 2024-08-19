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
  const [className, setClassName] = useState("");
  const [department, setDepartment] = useState("");
  const [rollNo, setRollNo] = useState("");
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

  const capture = async () => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      try {
        const file = base64ToFile(imageSrc, "face_image.jpg");
        const formData = new FormData();
        formData.append("name", name);
        formData.append("age", age);
        formData.append("class_name", className);
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
        alert("Person added successfully!");
        console.log("Response:", response.data); // Log response for debugging
      } catch (error) {
        console.error("Error adding person:", error);
        alert("Error adding person. Check the console for details.");
      }
    } else {
      alert("No image captured");
    }
  };

  const handleTakeAttendance = () => {
    navigate("/validate-person");
  };

  return (
    <Container>
      <Grid container spacing={3} style={{ marginTop: "20px" }}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} style={{ padding: "20px" }}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              style={{ marginBottom: "20px" }}
              onClick={handleTakeAttendance}
            >
              Take Attendance
            </Button>
            <Typography variant="h5" gutterBottom>
              Add Person
            </Typography>
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              style={{ minHeight: "400px" }}
            >
              <Webcam
                ref={webcamRef}
                mirrored={true}
                screenshotFormat="image/jpeg"
                style={{ width: "100%", maxWidth: "400px" }}
              />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} style={{ padding: "20px" }}>
            <Typography variant="h5" gutterBottom>
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
                startAdornment: <Person style={{ marginRight: "8px" }} />,
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
                startAdornment: <Numbers style={{ marginRight: "8px" }} />,
              }}
            />
            <TextField
              fullWidth
              label="Class"
              variant="outlined"
              margin="normal"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              InputProps={{
                startAdornment: <School style={{ marginRight: "8px" }} />,
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
                startAdornment: <Domain style={{ marginRight: "8px" }} />,
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
                startAdornment: <Class style={{ marginRight: "8px" }} />,
              }}
            />
            <Button
              variant="contained"
              color="primary"
              fullWidth
              style={{ marginTop: "20px" }}
              onClick={capture}
            >
              Capture & Save
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AddPerson;
