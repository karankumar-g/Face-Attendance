import React, { useState } from "react";
import Webcam from "react-webcam";
import axios from "axios";
import {
  Container,
  Grid,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
} from "@mui/material";
import { CameraAlt, Clear, Person, Class } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const ValidatePerson = () => {
  const [people, setPeople] = useState([]);
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
      const file = base64ToFile(imageSrc, "face_image.jpg");
      const formData = new FormData();
      formData.append("face_image", file);

      try {
        const response = await axios.post(
          "http://localhost:8000/api/validate/",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        setPeople((prevPeople) => [...prevPeople, response.data]); // Append the new person to the list
      } catch (error) {
        console.error("Error validating person:", error);
        alert("No match found!");
      }
    } else {
      alert("No image captured");
    }
  };

  const clearTable = () => setPeople([]);

  return (
    <Container>
      <Grid container spacing={3} style={{ marginTop: "20px" }}>
        <Grid item xs={12} md={6} style={{ position: "relative" }}>
          <Paper elevation={3} style={{ padding: "20px" }}>
            <Typography variant="h5" gutterBottom>
              Validate Person
            </Typography>
            <Button
              variant="contained"
              color="primary"
              style={{
                position: "absolute",
                bottom: "20px",
                right: "20px",
              }}
              onClick={() => navigate("/add-person")}
            >
              Add Person
            </Button>
            <Webcam
              ref={webcamRef}
              mirrored={true}
              screenshotFormat="image/jpeg"
              style={{ width: "100%", maxWidth: "400px", marginBottom: "20px" }}
            />
            <Button
              variant="contained"
              color="primary"
              style={{ marginBottom: "10px" }}
              onClick={capture}
              startIcon={<CameraAlt />}
            >
              Capture & Validate
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              style={{ marginBottom: "10px", marginLeft: "10px" }}
              onClick={clearTable}
              startIcon={<Clear />}
            >
              Clear Table
            </Button>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} style={{ padding: "20px" }}>
            <Typography variant="h5" gutterBottom>
              Person Details
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>S.No</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Roll No</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {people.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3}>No records found</TableCell>
                    </TableRow>
                  ) : (
                    people.map((person, index) => (
                      <TableRow key={index}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          <IconButton>
                            <Person />
                          </IconButton>
                          {person.name}
                        </TableCell>
                        <TableCell>
                          <IconButton>
                            <Class />
                          </IconButton>
                          {person.roll_no}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ValidatePerson;
