import { useEffect, useState } from 'react'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import type { SearchResult } from '../content/game-adapter'

export interface SearchCommandProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  search: (text: string) => Promise<SearchResult[]>
  onSelect: (result: SearchResult) => void
}

export function SearchCommand(props: SearchCommandProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])

  useEffect(() => {
    const lifecycle = new AbortController()
    if (query.trim().length < 3) {
      setResults([])
      return
    }
    void props.search(query).then((value) => {
      if (!lifecycle.signal.aborted) setResults(value)
    })
    return () => lifecycle.abort()
  }, [props.search, query])

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent>
        <DialogTitle>Search the atlas</DialogTitle>
        <Command shouldFilter={false}>
          <CommandInput
            value={query}
            onValueChange={setQuery}
            placeholder="Search quests, lore, secrets, and places"
          />
          <CommandList>
            <CommandEmpty>
              {query.length < 3
                ? 'Enter at least three characters.'
                : 'No results.'}
            </CommandEmpty>
            {(['step', 'discovery', 'location'] as const).map((kind) => (
              <CommandGroup key={kind} heading={kind}>
                {results
                  .filter((result) => result.kind === kind)
                  .map((result) => (
                    <CommandItem
                      key={`${result.kind}-${result.id}`}
                      value={`${result.kind}:${result.id}`}
                      onSelect={() => {
                        props.onSelect(result)
                        props.onOpenChange(false)
                      }}
                    >
                      {result.title}
                    </CommandItem>
                  ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  )
}
