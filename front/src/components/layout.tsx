import { Box, Button, Flex, VStack, Heading, Text, Icon } from "@chakra-ui/react";
import axios from "axios";
import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { RiHomeLine, RiAlbumLine, RiPlayListLine, RiSearchLine, RiTeamLine } from 'react-icons/ri'

function Layout() {
    const navigate = useNavigate();
    useEffect(() => { (async() => {
        try {
            await axios.post("/api/authentication", {});
        } catch {
            navigate("/login");
        } 
    })();
    }, []);

    async function logout() {
        try {
            await axios.post("/api/logout", {});
            navigate("/login");
        } catch(err) {
            console.log(err);
        } 
    }

    return (
        <Flex alignItems="stretch" backgroundColor="#171923" height="100vh">
            <Box w="15%" bg="#0F1016" color="white" height="100%">
                <VStack flex="1" alignItems="center" align="start" marginTop={"5vh"}>
                    <Heading size="5xl" mb={4}>SPiN.</Heading>
                    <Button
                        variant="ghost"
                        justifyContent="flex-start"
                        w="70%"
                        _hover={{ bg: "#4A5568" }}
                        onClick={() => navigate("/feed")}
                    >
                        <Flex align="center" gap={2}>
                            <Icon as={RiHomeLine} boxSize={5} />
                            <Text>Home</Text>
                        </Flex>
                    </Button>
                    <Button
                        variant="ghost"
                        justifyContent="flex-start"
                        w="70%"
                        _hover={{ bg: "#4A5568" }}
                        onClick={() => navigate("/collection")}
                    >
                        <Flex align="center" gap={2}>
                            <Icon as={RiAlbumLine} boxSize={5} />
                            <Text>Collection</Text>
                        </Flex>
                    </Button>
                    <Button
                        variant="ghost"
                        justifyContent="flex-start"
                        w="70%"
                        _hover={{ bg: "#4A5568" }}
                        onClick={() => navigate("/wants")}
                    >
                        <Flex align="center" gap={2}>
                            <Icon as={RiPlayListLine} boxSize={5} />
                            <Text>Wishlist</Text>
                        </Flex>
                    </Button>
                    <Button
                        variant="ghost"
                        justifyContent="flex-start"
                        w="70%"
                        _hover={{ bg: "#4A5568" }}
                        onClick={() => navigate("/search")}
                    >
                        <Flex align="center" gap={2}>
                            <Icon as={RiSearchLine} boxSize={5} />
                            <Text>Search</Text>
                        </Flex>
                    </Button>
                    <Button
                        variant="ghost"
                        justifyContent="flex-start"
                        w="70%"
                        _hover={{ bg: "#4A5568" }}
                        onClick={() => navigate("/friends")}
                    >
                        <Flex align="center" gap={2}>
                            <Icon as={RiTeamLine} boxSize={5} />
                            <Text>Friends</Text>
                        </Flex>
                    </Button>
                    <Button
                        justifyContent="center"
                        w="60%"
                        bg="transparent"
                        color="white" 
                        borderColor={"white"}
                        onClick={() => logout()}
                        mt={6}
                    >
                        Logout
                    </Button>
                </VStack>
            </Box>

            <Box w="85%" height="100%" overflowY="auto">
                <Outlet />
            </Box>
        </Flex >
    );
}

export default Layout;
