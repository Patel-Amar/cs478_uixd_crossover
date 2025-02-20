import './Search.css';
import { Button, ButtonGroup, Container, Heading, HStack, Input, VStack, Text, Box, Grid } from "@chakra-ui/react";
import { LuSearch } from 'react-icons/lu';
import { InputGroup } from './ui/input-group';
import { useState } from 'react';
import axios from 'axios';
import { Image } from "@chakra-ui/react"
import { albumType } from './utils';

function Search() {
    const [albums, setAlbums] = useState<albumType[]>([]);
    const [search, setSearch] = useState<string>("");
    const [hasresult, setHasresult] = useState<boolean>(true);
    const [selectedAlbum, setSelectedAlbum] = useState<albumType | null>(null);
    const [tracks, setTracks] = useState<{ name: string; duration: number }[]>([]);


    async function searchResults() {
        if (search !== null) {
            const resp = await axios.get(`/api/search/${search}`);
            const fetched = resp.data.albums;
            setAlbums(fetched);
            setHasresult(fetched.length !== 0);
        }
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
                width="70%"
                alignItems="center"
                color="white"
            >
                <Container width="90%" padding="0" marginBottom={"1rem"}>
                    <Heading size="2xl">Add Vinyl</Heading>
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
                        >
                            <Input placeholder="Search for Any Vinyl" border="none" color="white" onChange={(e) => { setSearch(e.target.value) }} value={search} />
                        </InputGroup>
                        <ButtonGroup
                            size="sm"
                            variant="outline"
                            borderColor="white"
                            borderRadius="4px"
                            borderWidth="1px"
                            width={"15%"}
                            display="flex"
                            justifyContent="center"
                        >
                            <Button color="white" border={"none"} type='submit'>Search</Button>
                        </ButtonGroup>
                    </HStack>
                </form>
                {!hasresult ?
                    <Text> No Album Found</Text> :
                    <Grid
                        templateColumns="repeat(2, 1fr)"
                        gap={6}
                        width="95%"
                        marginTop={"1rem"}
                        marginBottom={"1vh"}
                    >
                        {albums.map((album, index) => (
                            <Box 
                                key={index} 
                                padding="1rem" 
                                borderRadius="md" 
                                _hover={{ bg: "#0F1016" }}
                                cursor="pointer"
                                onClick={async () => {
                                    console.log("Album clicked:", album); // Check if album is being passed correctly
                                    setSelectedAlbum(album);
                                    try {
                                        console.log("Fetching tracks for album:", album.id); // Check if album.id is correct
                                        const resp = await axios.get(`/api/search/album/${album.id}`);
                                        setTracks(resp.data.tracks || []); // Ensure it's an array
                                    } catch (error) {
                                        console.error("Error fetching album details:", error);
                                        setTracks([]); // Set to empty array to avoid crashing
                                    }
                                }}
                                
                                
                            >
                                <HStack>
                                    <Image src={album.album_image || "/tmp.png"} width={"30%"} />
                                    <VStack align={"start"} gap={"0"}>
                                        <Text color="white" fontWeight={"bold"}>{album.name.length > 15 ? album.name.substring(0, 15) + " ..." : album.name}</Text>
                                        <Text color="#E2E8F0">{album.artists?.[0] || ""}</Text>
                                        <Text color="#E2E8F0">{album.release.substring(0, 4) || ""}</Text>
                                    </VStack>
                                </HStack>
                            </Box>
                        ))}

                    </Grid>
                }
            </VStack>

            <VStack
                width="30%"
                minHeight={"100%"}
                backgroundColor="#0F1016"
                borderRadius="8px"
                boxShadow="lg"
                color="white"
                alignItems="center"
                justifyContent={"start"}
                padding="1rem"
            >
                {selectedAlbum ? (
                    <>
                        <Image src={selectedAlbum.album_image || "/tmp.png"} width="80%" />
                        <Heading size="md">{selectedAlbum.name}</Heading>
                        <Text>{selectedAlbum.artists.join(", ")}</Text>
                        <Text>{selectedAlbum.release.substring(0, 4)}</Text>
                        <VStack align="start" width="100%">
                            {tracks?.length > 0 ? (
                                tracks.map((track, idx) => (
                                    <Text key={idx} fontSize="sm">
                                        {idx + 1}. {track.name}
                                    </Text>
                                ))
                            ) : (
                                <Text fontSize="sm" color="gray.400">
                                    Loading tracks...
                                </Text>
                            )}
                        </VStack>
                    </>
                ) : (
                    <Text marginTop={"10%"}>
                        No Album Selected
                    </Text>
                )}
            </VStack>

        </Container >
    );
}

export default Search;
