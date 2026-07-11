import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface GameSelectorProps {
  value: string
  games: Array<{ slug: string; title: string }>
  onValueChange: (slug: string) => void
}

export function GameSelector({
  value,
  games,
  onValueChange,
}: GameSelectorProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger
        aria-label="Game selector"
        className="min-h-11 w-52 border-border bg-secondary"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {games.map((game) => (
            <SelectItem key={game.slug} value={game.slug}>
              {game.title}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
