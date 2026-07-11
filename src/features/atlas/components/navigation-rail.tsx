import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'

export interface NavigationRailProps {
  region: string
  threadId?: string
  filters: string[]
  regions: Array<{ id: string; title: string }>
  threads: Array<{ id: string; title: string }>
  filterOptions: Array<{ id: string; title: string }>
  completed: number
  total: number
  onRegionChange: (region: string) => void
  onThreadChange: (threadId: string) => void
  onFiltersChange: (filters: string[]) => void
}

export function NavigationRail(props: NavigationRailProps) {
  function toggleFilter(id: string, checked: boolean) {
    props.onFiltersChange(
      checked
        ? Array.from(new Set([...props.filters, id])).sort()
        : props.filters.filter((filter) => filter !== id),
    )
  }

  const percent = props.total === 0 ? 0 : (props.completed / props.total) * 100

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-5 p-4">
        <div className="flex flex-col gap-2 text-sm">
          <span id="region-label">Region</span>
          <Select value={props.region} onValueChange={props.onRegionChange}>
            <SelectTrigger aria-labelledby="region-label" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {props.regions.map((region) => (
                  <SelectItem key={region.id} value={region.id}>
                    {region.title}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2 text-sm">
          <span id="storyline-label">Storyline</span>
          <Select value={props.threadId} onValueChange={props.onThreadChange}>
            <SelectTrigger aria-labelledby="storyline-label" className="w-full">
              <SelectValue placeholder="Choose a storyline" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {props.threads.map((thread) => (
                  <SelectItem key={thread.id} value={thread.id}>
                    {thread.title}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <Separator />
        <fieldset className="flex flex-col gap-3">
          <legend className="mb-1 text-sm font-medium">Layers</legend>
          {props.filterOptions.map((filter) => (
            <label
              key={filter.id}
              className="flex min-h-11 items-center gap-3 text-sm"
            >
              <Checkbox
                checked={props.filters.includes(filter.id)}
                onCheckedChange={(value) =>
                  toggleFilter(filter.id, value === true)
                }
              />
              {filter.title}
            </label>
          ))}
        </fieldset>
        <Separator />
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between">
            <span>Progress</span>
            <span>
              {props.completed} of {props.total}
            </span>
          </div>
          <Progress
            value={percent}
            aria-label={`${props.completed} of ${props.total} steps completed`}
          />
        </div>
      </div>
    </ScrollArea>
  )
}
