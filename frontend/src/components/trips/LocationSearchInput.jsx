import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Loader2, MapPin, Search } from 'lucide-react';
import { debounce } from 'lodash';

export default function LocationSearchInput({ value, onSelect, placeholder }) {
  const [query, setQuery] = useState(value || "");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const inputRef = useRef(null);

  const fetchLocations = async (searchQuery) => {
    if (searchQuery.length < 3) {
      setResults([]);
      return;
    }
    
    setIsLoading(true);
    try {
      // AI location lookup temporarily disabled while the agent is offline.
      setResults([]);
    } catch (error) {
      console.error("Error fetching locations:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const debouncedFetch = useCallback(debounce(fetchLocations, 400), []);

  useEffect(() => {
    if (value !== query) {
      setQuery(value || "");
    }
  }, [value]);

  const handleInputChange = (e) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    
    if (newQuery.length >= 3) {
      setOpen(true);
      debouncedFetch(newQuery);
    } else {
      setResults([]);
      setOpen(false);
    }
  };

  const handleSelect = (place) => {
    const fullAddress = `${place.name}, ${place.address}`;
    setQuery(fullAddress);
    setOpen(false);
    onSelect({
      address: fullAddress,
      coords: { lat: place.lat, lng: place.lng }
    });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
          <Input
            ref={inputRef}
            value={query}
            onChange={handleInputChange}
            onFocus={() => {
              if (query.length >= 3) setOpen(true);
            }}
            placeholder={placeholder}
            className="pl-10 text-base"
          />
          {isLoading && (
            <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-gray-500" />
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[var(--radix-popover-trigger-width)] p-0" 
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <Command shouldFilter={false}>
          <CommandList>
            {results.length > 0 && (
              <CommandGroup>
                {results.map((place, index) => (
                  <CommandItem
                    key={`${place.lat}-${place.lng}-${index}`}
                    onSelect={() => handleSelect(place)}
                    className="flex items-start gap-3.5 p-3 cursor-pointer"
                  >
                    <div className="bg-gray-100 rounded-md p-2 flex-shrink-0">
                      <MapPin className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 truncate">{place.name}</p>
                      <p className="text-xs text-gray-500 truncate">{place.address}</p>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            <CommandEmpty className="p-4 text-center">
              {isLoading ? (
                <div className="flex items-center justify-center gap-2 text-gray-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Buscando...</span>
                </div>
              ) : query.length >= 3 ? (
                <span className="text-sm text-gray-600">No se encontraron resultados</span>
              ) : (
                <span className="text-sm text-gray-600">Escribe para buscar una ubicación</span>
              )}
            </CommandEmpty>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
