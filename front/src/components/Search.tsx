import './Search.css'
import { Button, HStack, Input } from "@chakra-ui/react"
import { LuSearch } from 'react-icons/lu';
import { InputGroup } from './ui/input-group';
import { Field } from "@/components/ui/field"


function Search() {
    return (
        <HStack alignItems={"flex-end"}>
            <Field invalid label="Add Vinyl">
                <InputGroup
                    flex="1"
                    startElement={<LuSearch />}
                    width={'full'}
                >
                    <Input placeholder="Search for Any Vinyl" />
                </InputGroup>
            </Field>
            <Button>Click me</Button>
        </HStack>
    )
}

export default Search;
