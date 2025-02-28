import './Collection.css'
import {ButtonGroup, Container, Heading, HStack, VStack, Text, Box, Grid, IconButton } from "@chakra-ui/react";
// import { LuSearch } from 'react-icons/lu';
// import { InputGroup } from './ui/input-group';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Image } from "@chakra-ui/react"
import { albumType } from './utils';
import { RiIndeterminateCircleLine, RiHeartLine } from 'react-icons/ri'

function Collection() {
    const [albums, setAlbums] = useState<albumType[]>([]);
    // const [hasresult, setHasresult] = useState<boolean>(true);
    const [selectedAlbum, setSelectedAlbum] = useState<albumType | null>(null);
    const [tracks, setTracks] = useState<{ name: string; duration: number }[]>([]);

    async function fetchCollection() {
        try {
            const resp = await axios.get("/api/favorited/collection");
            setAlbums(resp.data.albums || []);
        } catch (error) {
            console.error("Error fetching collection:", error);
            setAlbums([]);
        }
    }
    
    useEffect(() => {
        fetchCollection();
    }, []);
    

    async function getAlbumTrack(album: albumType) {
        setSelectedAlbum(album);
    
        try {
            const resp = await axios.get(`/api/search/album/${album.id}`);
            setTracks(resp.data.tracks || []);
        } catch (error) {
            console.error("Error fetching album details:", error);
            setTracks([]);
        }
    }

    async function removeAlbum() {
        try {
            if (!selectedAlbum) {
                return;
            }
    
            const spotifyId = selectedAlbum.id;
            await axios.delete(`/api/favorited/album/${spotifyId}`);
            console.log("Album removed from wishlist!");
    
            setSelectedAlbum(null);
            fetchCollection();
        } catch (error) {
            console.error("Error removing album from wishlist:", error);
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
                    <Heading size="2xl">Collection</Heading>
                </Container>
                {albums.length===0 ?
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
                                onClick={() => getAlbumTrack(album)}
                            >
                                <HStack>
                                    <Image src={album.album_image || "/tmp.png"} width={"30%"} />
                                    <VStack align={"start"} gap={"0.5"} ml={2}>
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
                flex="1"
                width="30%"
                minHeight={"90vh"}
                backgroundColor="#0F1016"
                borderRadius="8px"
                color="white"
                alignItems="center"
                justifyContent={"center"}
                padding="1rem"
            >
                {selectedAlbum ? (
                    <>
                        <Image src={selectedAlbum.album_image || "/tmp.png"} width="100%" />
                        <VStack width="100%" flex="1" alignItems={"left"} gap={"0.5"} mt={4}>
                        <HStack flex="1" alignItems={"start"}>
                                <VStack flex="1" alignItems={"left"} mt={1}>
                                    <Heading size="2xl">{selectedAlbum.name}</Heading>
                                    <Text color="#E2E8F0" fontSize="md">{selectedAlbum.artists.join(", ")}</Text>
                                    <Text color="#E2E8F0" fontSize="md">{selectedAlbum.release.substring(0, 4)}</Text>
                                </VStack>
                                <HStack>
                                    <ButtonGroup
                                        size="md"
                                        variant="outline"
                                        display="flex"
                                        justifyContent={"start"}
                                        width="fit-content"
                                    >
                                        <IconButton color="white"><RiHeartLine /></IconButton>
                                    </ButtonGroup>
                                    <ButtonGroup
                                        size="md"
                                        variant="outline"
                                        border-color="red"
                                        display="flex"
                                        justifyContent={"start"}
                                        width="fit-content"
                                    >
                                        <IconButton color="white" onClick={() => removeAlbum()}><RiIndeterminateCircleLine /></IconButton>
                                    </ButtonGroup>
                                </HStack>
                            </HStack>
                            <VStack align="start" width="100%" mt={4}>
                                {tracks?.length > 0 ? (
                                    tracks.map((track, idx) => (
                                        <HStack 
                                        key={idx} 
                                        width="100%" 
                                        borderBottom={idx === tracks.length - 1 ? "none" : "1px solid #2D3748"} 
                                        gap={"4"} 
                                        pb={2}>
                                            <Text color="#A0AEC0">
                                                {idx + 1}.
                                            </Text>
                                            <Text color="#E2E8F0">
                                                {track.name}
                                            </Text>
                                        </HStack>
                                    ))
                                ) : (
                                    <Text fontSize="sm" color="gray.400">
                                        Loading tracks...
                                    </Text>
                                )}
                            </VStack>
                        </VStack>
                    </>
                ) : (
                    <VStack color="#718096">
                        <Heading size="2xl">Vinyl View</Heading>
                        <Text fontSize="md" textAlign="center" width="75%">
                            Click on a vinyl to view and
                            manage all details here
                        </Text>
                    </VStack>
                )}
            </VStack>

        </Container >
    );
}

export default Collection;
