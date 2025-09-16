import { useEffect, useState } from "react";
import { Autocomplete, AutocompleteItem } from "@heroui/react";
import apiClient from "../api/ApiClient";

interface Tag {
    tagId: string;
    name: string;
}

interface TagAutocompleteProps {
    setSelectedTag: React.Dispatch<React.SetStateAction<null| string>>;
}

export default function TagAutocomplete({ setSelectedTag }: TagAutocompleteProps) {
    const [options, setOptions] = useState<Tag[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchTags = async (query: string) => {
        setLoading(true);
        try {
            const res = await apiClient.get<{ items: Tag[] }>("/tag/", { params: { q: query } });
            setOptions(res.data.items || []);
        } catch (err) {
            console.error("Failed to fetch tags", err);
            setOptions([]);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchTags("")
    }, [])
    return (
        <Autocomplete
            label="Tag"
            isRequired
            labelPlacement="outside"
            name="tagId"
            placeholder="Select a tag..."
            items={options}
            isLoading={loading}
            onInputChange={(value) => fetchTags(value)}
            onSelectionChange={(value) => setSelectedTag(value as any)} // return tagId to parent
        >
            {(item) => <AutocompleteItem key={item.tagId}>{item.name}</AutocompleteItem>}
        </Autocomplete>
    );
}
