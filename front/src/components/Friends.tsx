import { useEffect, useState } from 'react';
import './Friends.css'
import { Button, ButtonGroup, Container, Heading, HStack, Input, VStack, Text, Grid, Box, IconButton } from "@chakra-ui/react";
import { LuSearch } from 'react-icons/lu';
import { RiIndeterminateCircleLine } from 'react-icons/ri'
import { InputGroup } from './ui/input-group';
import { friendsType } from './utils';
import axios from 'axios';

function Friends() {
    const [friends, setFriends] = useState<friendsType[]>([]);
    const [search, setSearch] = useState<string>("");
    const [friendRequests, setFriendRequests] = useState<friendsType[]>([]);
    const [userSearchResults, setUserSearchResults] = useState<friendsType[]>([]);
    const [sendSuccess, setSendSuccess] = useState<boolean>(false);
    const [hasresult, setHasresult] = useState<boolean>(true);

    useEffect(() => {
        (async () => {
            const resp = await axios.get(`/api/friends/requests`);
            const fetched = resp.data.message;
            setFriendRequests(fetched);
        })();
    }, []);

    useEffect(() => {
        (async () => {
            const resp = await axios.get(`/api/friends/friends`);
            const fetched = resp.data.message;
            setFriends(fetched);
        })();
    }, []);

    async function searchResults() {
        if (search !== null) {
            const resp = await axios.get(`/api/friends/search/${search}`);
            const fetched = resp.data.message;
            setUserSearchResults(fetched);
            setHasresult(fetched.length !== 0);
        }
    }

    async function sendFriendRequest(id: number) {
        await axios.post(`/api/friends/add/${id}`);
        setUserSearchResults(userSearchResults.filter(elem => elem.id !== id));
        setSendSuccess(true);
        setTimeout(() => { setSendSuccess(false) }, 2000);
    }

    async function acceptFriendRequest(friend: friendsType) {
        await axios.put(`/api/friends/accept/${friend.id}`);
        setFriendRequests(friendRequests.filter(elem => elem.id !== friend.id));
        setFriends([...friends, friend]);
    }

    async function declineFriendRequest(friend: friendsType) {
        await axios.delete(`/api/friends/deny/${friend.id}`);
        setFriendRequests(friendRequests.filter(elem => elem.id !== friend.id));
    }

    async function deleteFriend(friend: friendsType) {
        await axios.delete(`/api/friends/remove/${friend.id}`);
        setFriends(friends.filter(elem => elem.id !== friend.id));
    }
    return (
        <Container
            width="100%"
            height="100vh"
            display="flex"
            flexDirection="row"
            justifyContent="space-between"
            alignItems="flex-start"
            marginTop={"7vh"}
        >
            <VStack
                width="100%"
                alignItems="center"
                color="white"
            >
                <Container width="90%" padding="0" marginBottom={"1rem"}>
                    <Heading size="2xl">Add Friends</Heading>
                </Container>
                <form
                    style={{ width: "90%" }}
                    onSubmit={(e) => {
                        e.preventDefault();
                        searchResults();
                    }}
                >
                    <HStack>
                        <InputGroup
                            flex="1"
                            startElement={<LuSearch />}
                            backgroundColor="#0F1016"
                            borderRadius="3px"
                            border={sendSuccess ? "1px solid limegreen" : "none"}
                        >
                            <Input placeholder="Search for user" border="none" color="white" onChange={(e) => { setSearch(e.target.value) }} value={search} />
                        </InputGroup>
                        <ButtonGroup
                            size="sm"
                            variant="outline"
                            borderColor="white"
                            borderRadius="4px"
                            borderWidth="1px"
                            width={"10%"}
                            display="flex"
                            justifyContent="center"
                        >
                            <Button color="white" border={"none"} type='submit'>Search</Button>
                        </ButtonGroup>
                    </HStack>
                </form>
                {hasresult ?
                    <Grid
                        templateColumns="repeat(auto-fit, 1fr)"
                        gap={6}
                        width="90%"
                        marginTop={"1rem"}
                        marginBottom={"1vh"}
                    >
                        {userSearchResults.map((user, index) => (
                            <form key={index}
                                style={{
                                    width: "100%",
                                    backgroundColor: "#0F1016",
                                    paddingTop: "1rem",
                                    paddingBottom: "1rem"
                                }}
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    sendFriendRequest(user.id);
                                }}
                            >
                                <HStack width="100%">
                                    <Text color="#E2E8F0" flex="1" paddingLeft="1rem">{user?.friend_username || ""}</Text>
                                    <Box width="10%">
                                        <ButtonGroup
                                            size="sm"
                                            variant="outline"
                                            borderColor="white"
                                            borderRadius="4px"
                                            borderWidth="1px"
                                            display="flex"
                                            justifyContent={"start"}
                                            width="fit-content"
                                            paddingLeft="0.5rem"
                                            paddingRight="0.5rem"
                                        >
                                            <Button color="white" border={"none"} type='submit'>Add</Button>
                                        </ButtonGroup>
                                    </Box>
                                </HStack>
                            </form>
                        ))
                        }

                    </Grid>
                    : <Text> No user found with this name. Perhaps a friend request has aleady been sent out?</Text>}
                <Container width="90%" padding="0">
                    <Heading size="2xl">Requests</Heading>
                </Container>
                <Grid
                    templateColumns="repeat(auto-fit, 1fr)"
                    gap={6}
                    width="90%"
                    marginTop={"1rem"}
                    marginBottom={"1rem"}
                >
                    {friendRequests.map((request, index) => (
                        <form key={index}
                            style={{
                                width: "100%",
                                backgroundColor: "#0F1016",
                                paddingTop: "1rem",
                                paddingBottom: "1rem"
                            }}
                        >
                            <HStack width="100%">
                                <Text color="#E2E8F0" flex="1" paddingLeft="1rem">{request?.friend_username || ""}</Text>
                                <HStack marginRight={"1rem"}>
                                    <ButtonGroup
                                        size="sm"
                                        variant="outline"
                                        borderColor="white"
                                        borderRadius="4px"
                                        borderWidth="1px"
                                        display="flex"
                                        justifyContent={"start"}
                                        width="fit-content"
                                        paddingLeft="0.5rem"
                                        paddingRight="0.5rem"
                                    >
                                        <Button color="white" border={"none"} onClick={() => declineFriendRequest(request)}>Decline</Button>
                                    </ButtonGroup>
                                    <ButtonGroup
                                        size="sm"
                                        variant="outline"
                                        borderColor="white"
                                        borderRadius="4px"
                                        borderWidth="1px"
                                        display="flex"
                                        justifyContent={"start"}
                                        width="fit-content"
                                        paddingLeft="0.5rem"
                                        paddingRight="0.5rem"
                                    >
                                        <Button color="white" border={"none"} onClick={() => acceptFriendRequest(request)}>Accept</Button>
                                    </ButtonGroup>
                                </HStack>
                            </HStack>
                        </form>
                    ))}

                </Grid>
                <Container width="90%" padding="0">
                    <Heading size="2xl">Friends</Heading>
                </Container>
                <Grid
                    templateColumns="repeat(auto-fit, 1fr)"
                    gap={6}
                    width="90%"
                    marginTop={"1rem"}
                    marginBottom={"1rem"}
                >
                    {friends.map((friend, index) => (
                        <form key={index}
                            style={{
                                width: "100%",
                                backgroundColor: "#0F1016",
                                paddingTop: "1rem",
                                paddingBottom: "1rem"
                            }}
                        >
                            <HStack width="100%">
                                <Text color="#E2E8F0" flex="1" paddingLeft="1rem">{friend?.friend_username || ""}</Text>
                                <HStack marginRight={"1rem"}>
                                    <ButtonGroup
                                        size="sm"
                                        variant="outline"
                                        display="flex"
                                        justifyContent={"start"}
                                        width="fit-content"
                                        paddingLeft="0.5rem"
                                        paddingRight="0.5rem"
                                    >
                                        <IconButton color="white" onClick={() => deleteFriend(friend)}><RiIndeterminateCircleLine /></IconButton>
                                    </ButtonGroup>
                                </HStack>
                            </HStack>
                        </form>
                    ))}

                </Grid>
            </VStack>

        </Container >
    );
}

export default Friends;
