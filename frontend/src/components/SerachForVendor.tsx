import { useEffect, useState } from "react";
import { Autocomplete, AutocompleteItem } from "@heroui/react";
import apiClient from "../api/ApiClient";

interface vendor {
    vendorId: string;
    name: string;
}

interface VendorAutocompleteProps {
    setSelectedvendor: React.Dispatch<React.SetStateAction<null| string>>;
}

export default function VendorAutocomplete({ setSelectedvendor }: VendorAutocompleteProps) {
    const [options, setOptions] = useState<vendor[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchvendors = async (query: string) => {
        setLoading(true);
        try {
            const res = await apiClient.get<{ items: vendor[] }>("/vendor/", { params: { q: query } });
            setOptions(res.data.items || []);
        } catch (err) {
            console.error("Failed to fetch Vendors", err);
            setOptions([]);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchvendors("")
    }, [])
    return (
        <Autocomplete
            label="Vendor"
            isRequired
            labelPlacement="outside"
            name="vendorId"
            placeholder="Select a vendor..."
            items={options}
            isLoading={loading}
            onInputChange={(value) => fetchvendors(value)}
            onSelectionChange={(value) => setSelectedvendor(value as any)} // return vendorId to parent
        >
            {(item) => <AutocompleteItem key={item.vendorId}>{item.name}</AutocompleteItem>}
        </Autocomplete>
    );
}
