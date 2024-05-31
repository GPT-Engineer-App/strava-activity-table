import React, { useState, useEffect } from "react";
import { Container, Button, Table, Thead, Tbody, Tr, Th, Td, VStack, Text, Spinner } from "@chakra-ui/react";
import { FaStrava } from "react-icons/fa";

const clientId = "YOUR_STRAVA_CLIENT_ID";
const clientSecret = "YOUR_STRAVA_CLIENT_SECRET";
const redirectUri = "YOUR_REDIRECT_URI";

const Index = () => {
  const [accessToken, setAccessToken] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    if (code) {
      fetchAccessToken(code);
    }
  }, []);

  const fetchAccessToken = async (code) => {
    setLoading(true);
    try {
      const response = await fetch("https://www.strava.com/oauth/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code: code,
          grant_type: "authorization_code",
        }),
      });
      const data = await response.json();
      setAccessToken(data.access_token);
      fetchActivities(data.access_token);
    } catch (error) {
      console.error("Error fetching access token:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async (token) => {
    setLoading(true);
    try {
      const response = await fetch("https://www.strava.com/api/v3/athlete/activities", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setActivities(data);
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    window.location.href = `https://www.strava.com/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&scope=read,activity:read_all`;
  };

  return (
    <Container centerContent maxW="container.md" height="100vh" display="flex" flexDirection="column" justifyContent="center" alignItems="center">
      <VStack spacing={4}>
        <Text fontSize="2xl">Strava Activities</Text>
        {!accessToken ? (
          <Button leftIcon={<FaStrava />} colorScheme="orange" onClick={handleLogin}>
            Login with Strava
          </Button>
        ) : loading ? (
          <Spinner size="xl" />
        ) : (
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th>Distance (m)</Th>
                <Th>Moving Time (s)</Th>
                <Th>Type</Th>
              </Tr>
            </Thead>
            <Tbody>
              {activities.map((activity) => (
                <Tr key={activity.id}>
                  <Td>{activity.name}</Td>
                  <Td>{activity.distance}</Td>
                  <Td>{activity.moving_time}</Td>
                  <Td>{activity.type}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </VStack>
    </Container>
  );
};

export default Index;
