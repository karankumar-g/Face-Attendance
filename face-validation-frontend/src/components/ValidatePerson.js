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
  Box,
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

        const personExists = people.some(
          (person) => person.roll_no === response.data.roll_no
        );

        if (personExists) {
          alert("This person is already in the list.");
        } else {
          setPeople((prevPeople) => [...prevPeople, response.data]);
        }
      } catch (error) {
        console.error("Error validating person:", error);
        alert("No match found!");
      }
    } else {
      alert("No image captured");
    }
  };

  const clearTable = () => setPeople([]);

  const handleAddPerson = () => {
    navigate("/");
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
          onClick={handleAddPerson}
        >
          Add Person
        </Button>
      </Box>
      <Grid container spacing={4} style={{ marginTop: "0px" }}>
        <Grid item xs={12} md={6}>
          <Paper
            elevation={6}
            style={{
              padding: "20px",
              backgroundColor: "#f9fbe7",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
              height: "100%",
            }}
          >
            <Typography variant="h5" gutterBottom style={{ color: "#388e3c" }}>
              Person Details
            </Typography>
            <TableContainer
              component={Paper}
              style={{
                maxHeight: "400px",
                overflowY: "auto",
                flexGrow: 1,
              }}
            >
              <Table stickyHeader>
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
                marginBottom: "10px",
              }}
            >
              Validate Person
            </Typography>
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              style={{ minHeight: "400px", marginTop: "0px" }}
            >
              <Webcam
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                style={{
                  width: "100%",
                  maxWidth: "400px",
                  borderRadius: "10px",
                  border: "3px solid #3f51b5",
                }}
              />
              <Button
                variant="contained"
                fullWidth
                style={{
                  marginTop: "20px",
                  backgroundColor: "#3f51b5",
                  color: "white",
                }}
                onClick={capture}
                startIcon={<CameraAlt />}
              >
                Capture & Validate
              </Button>
              <Button
                variant="outlined"
                fullWidth
                style={{
                  marginTop: "10px",
                  color: "#f50057",
                  borderColor: "#f50057",
                }}
                onClick={clearTable}
                startIcon={<Clear />}
              >
                Clear Table
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ValidatePerson;
