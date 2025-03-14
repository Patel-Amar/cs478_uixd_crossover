import {
    Box,
    Button,
    ButtonGroup,
    Container,
    Heading,
    HStack,
    Textarea,
    VStack,
    List,
    Input,
    Image,
    IconButton,
    Text,
} from "@chakra-ui/react";
import "./Feed.css";
import { InputGroup } from "./ui/input-group";
import { RiPlayListAddFill } from "react-icons/ri";
import { useEffect, useState } from "react";
import {
    PopoverArrow,
    PopoverBody,
    PopoverContent,
    PopoverRoot,
    PopoverTrigger,
} from "@/components/ui/popover";
import axios from "axios";
import { albumType, commentType, getAxiosErrorMessages, postType } from "./utils";
import { RiIndeterminateCircleLine } from "react-icons/ri";
import { RiChat3Line } from "react-icons/ri";

function Feed() {
    const [searchQuery, setSearchQuery] = useState("");
    const [albums, setAlbums] = useState<albumType[]>([]);
    const [selectedAlbum, setSelectedAlbum] = useState<albumType>();
    const [post, setPost] = useState<string>("");
    const [error, setError] = useState<string[]>([]);
    const [friendsPost, setFriendsPost] = useState<postType[]>([]);
    const [updatePost, setUpdatePost] = useState<boolean>(false);
    const [comment, setComment] = useState<string>("");
    const [toggleComment, setToggleComment] = useState<boolean>(false);
    const [selectedComment, setSelectedComment] = useState<number>(-1);
    const [comments, setComments] = useState<commentType[]>([]);

    useEffect(() => {
        (async () => {
            let resp = await axios.get(`/api/favorited/collection`);
            const collections = resp.data.albums;
            resp = await axios.get(`/api/favorited/wishlist`);
            const wishlist = resp.data.albums;
            setAlbums([...collections, ...wishlist]);
        })();
    }, []);

    useEffect(() => {
        (async () => {
            try {
                const resp = await axios.get(`/api/feed`);
                setFriendsPost(resp.data.post.reverse());
            } catch (err) {
                console.log(err);
            }
        })();
    }, [updatePost]);

    useEffect(() => {
        (async () => {
            try {
                const resp = await axios.get(`/api/comment/`);
                setComments(resp.data.post)
            } catch (err) {
                console.log(err);
            }
        })();
    }, [toggleComment]);

    function getComments(post_id: number) {
        const arr: React.ReactElement[] = [];
        for (const data of comments.filter((e) => e.post_id === post_id)) {
            arr.push(<VStack display={"flex"} alignItems={"flex-start"} marginLeft={"1rem"}>
                <Text fontSize={"1rem"}>{data.username}:</Text>
                <Text fontSize={"0.75rem"}>{data.comment}</Text>
            </VStack>)
        }
        return arr;
    }

    async function sendPost() {
        try {
            if (!post) {
                return;
            }

            if (!selectedAlbum || !selectedAlbum?.id) {
                setError(["Need to share a playlist"]);
                return;
            }

            await axios.post(`/api/feed/`, {
                post: post,
                album_id: selectedAlbum?.id,
            });

            setError([]);
            setPost("");
            setUpdatePost(!updatePost);
        } catch (err) {
            setError(getAxiosErrorMessages(err));
        }
    }

    async function sendComment(post_id: number) {
        if (comment) {
            try {
                await axios.post(`/api/comment/`, {
                    post_id: post_id,
                    comment: comment,
                });
                setComment("");
                setToggleComment(!toggleComment);
            } catch (err) {
                setError(getAxiosErrorMessages(err));
            }
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
            <VStack width="100%" alignItems="center" color="white">
                <Container width="90%" padding="0" marginBottom={"1rem"}>
                    <Heading size="2xl">Home</Heading>
                </Container>
                <form
                    style={{ width: "90%" }}
                    onSubmit={(e) => {
                        e.preventDefault();
                        sendPost();
                    }}
                >
                    <VStack
                        backgroundColor="#0F1016"
                        padding={"2%"}
                        borderRadius={"20px"}
                    >
                        {error.map((err) => (
                            <Text color="red">{err}</Text>
                        ))}

                        <HStack width="100%" alignItems="center">
                            <PopoverRoot>
                                <PopoverTrigger>
                                    <Box maxWidth="fit-content">
                                        <Button
                                            background="none"
                                            padding="0"
                                            color={"#718096"}
                                            fontSize={".85rem"}
                                            textDecoration={"underline"}
                                            display="inline-flex"
                                            alignItems="center"
                                        >
                                            <HStack alignItems="center" justifyContent="flex-start">
                                                {!selectedAlbum ? (
                                                    <>
                                                        <RiPlayListAddFill color={"#718096"} />
                                                        <span>Share Record</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Image
                                                            src={selectedAlbum.album_image || "/tmp.png"}
                                                            objectFit="cover"
                                                            width={"2rem"}
                                                        />
                                                        <span>{selectedAlbum.name}</span>
                                                        <ButtonGroup
                                                            size="sm"
                                                            variant="plain"
                                                            display="flex"
                                                            justifyContent={"start"}
                                                            width="fit-content"
                                                        >
                                                            <IconButton
                                                                color="white"
                                                                onClick={() => setSelectedAlbum(undefined)}
                                                            >
                                                                <RiIndeterminateCircleLine />
                                                            </IconButton>
                                                        </ButtonGroup>
                                                    </>
                                                )}
                                            </HStack>
                                        </Button>
                                    </Box>
                                </PopoverTrigger>
                                <PopoverContent
                                    bg="#1A202C"
                                    color="white"
                                    borderRadius="10px"
                                    width="250px"
                                >
                                    <PopoverArrow />
                                    <PopoverBody>
                                        <Input
                                            placeholder="Search Playlists..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            marginBottom={"0.25rem"}
                                            size="sm"
                                            borderRadius="md"
                                            color="white"
                                        />
                                        <List.Root listStyleType={"none"}>
                                            {albums
                                                .filter((a) =>
                                                    a.name
                                                        .toLowerCase()
                                                        .includes(searchQuery.toLowerCase())
                                                )
                                                .map((album, index) => (
                                                    <List.Item key={index}>
                                                        <HStack
                                                            marginTop={".5rem"}
                                                            marginBottom={".5rem"}
                                                            padding={".3rem"}
                                                            _hover={{ bg: "gray.700", cursor: "pointer" }}
                                                            onClick={() => setSelectedAlbum(album)}
                                                        >
                                                            <Image
                                                                src={album.album_image || "/tmp.png"}
                                                                width={"20%"}
                                                            />
                                                            {album.name}
                                                        </HStack>
                                                        <Box
                                                            backgroundColor={"#2D3748"}
                                                            height={"1px"}
                                                            width={"100%"}
                                                        ></Box>
                                                    </List.Item>
                                                ))}
                                        </List.Root>
                                    </PopoverBody>
                                </PopoverContent>
                            </PopoverRoot>
                        </HStack>

                        <HStack width="100%" alignItems="flex-start">
                            <InputGroup flex="1" borderRadius="3px">
                                <Textarea
                                    placeholder="What's your latest music update?"
                                    border="none"
                                    color="white"
                                    resize="none"
                                    focusRing="none"
                                    fontSize=".85rem"
                                    _placeholder={{ color: "#718096" }}
                                    value={post}
                                    onChange={(e) => setPost(e.target.value)}
                                />
                            </InputGroup>
                            <Box alignSelf="flex-end" width={"5%"}>
                                <ButtonGroup
                                    size="sm"
                                    variant="outline"
                                    borderColor="white"
                                    borderRadius="4px"
                                    borderWidth="1px"
                                    display="flex"
                                    justifyContent="center"
                                >
                                    <Button color="white" border="none" type="submit">
                                        Post
                                    </Button>
                                </ButtonGroup>
                            </Box>
                        </HStack>
                    </VStack>
                </form>

                <form style={{ width: "90%" }}
                    onSubmit={(e) => {
                        e.preventDefault();
                    }}>
                    <VStack width={"100%"}>
                        {friendsPost.map((friendPost, index) => (
                            <VStack
                                key={index}
                                backgroundColor="#0F1016"
                                padding={"2%"}
                                borderRadius={"20px"}
                                alignItems={"flex-start"}
                                justifyContent={"flex-start"}
                                alignContent={"flex-start"}
                                width={"100%"}
                            >
                                <Text fontSize={"1.25rem"} p={0}>
                                    {friendPost.username}
                                </Text>
                                <HStack
                                    marginTop={".5rem"}
                                    marginBottom={".5rem"}
                                    padding={".3rem"}
                                >
                                    <Image
                                        src={friendPost.album_image || "/tmp.png"}
                                        width={"1.5rem"}
                                        p={0}
                                    />
                                    <Text fontSize={".75rem"}>{friendPost.name} </Text>
                                </HStack>
                                <Text>{friendPost.post}</Text>
                                <ButtonGroup
                                    size="sm"
                                    variant="plain"
                                    display="flex"
                                    justifyContent={"start"}
                                    width="fit-content"
                                >
                                    <IconButton
                                        onClick={() => {
                                            setSelectedComment(index);
                                            setToggleComment(!toggleComment);

                                        }}
                                    >
                                        <RiChat3Line color="gray"></RiChat3Line>
                                    </IconButton>
                                </ButtonGroup>

                                {toggleComment && selectedComment === index ?
                                    <>
                                        <Textarea
                                            resize="none"
                                            placeholder={"What would you like to say?"}
                                            border={"1px gray solid"} height={"8rem"}
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}>
                                        </Textarea>
                                        <Box width={"100%"} display={"flex"} justifyContent={"flex-end"}>
                                            <ButtonGroup
                                                size="sm"
                                                variant="outline"
                                                borderColor="white"
                                                borderRadius="4px"
                                                borderWidth="1px"
                                                display="flex"
                                                justifyContent="flex-center"
                                            >
                                                <Button color="white" border="none" type="submit" onClick={async () => await sendComment(friendPost.id)}>
                                                    Comment
                                                </Button>
                                            </ButtonGroup>
                                        </Box>
                                    </>
                                    : ""}

                                {getComments(friendPost.id)}


                            </VStack>
                        ))}
                    </VStack>
                </form>
            </VStack >
        </Container >
    );
}
export default Feed;
