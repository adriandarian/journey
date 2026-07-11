import {
  Layers3,
  LinkIcon,
  MoreHorizontal,
  RotateCcw,
  Search,
  Settings,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { GameSelector } from './game-selector'
import type { AtlasPreferences } from '../progress/preferences-repository'
import type { ReactNode } from 'react'

type AtlasMode = 'map' | 'thread' | 'timeline'

export interface TopCommandBarProps {
  gameSlug: string
  games: Array<{ slug: string; title: string }>
  mode: AtlasMode
  preferences: AtlasPreferences
  status?: ReactNode
  onGameChange: (slug: string) => void
  onPreferencesChange: (patch: Partial<AtlasPreferences>) => void
  onModeChange: (mode: AtlasMode) => void
  onSearch: () => void
  onTraceStory: () => void
  onLayers: () => void
  onCopyLink: () => void
  onZoomIn: () => void
  onZoomOut: () => void
  onResetView: () => void
}

function PreferenceControls({
  preferences,
  onChange,
}: {
  preferences: AtlasPreferences
  onChange: (patch: Partial<AtlasPreferences>) => void
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 text-sm">
        <span id="motion-label">Motion</span>
        <Select
          value={preferences.motion}
          onValueChange={(motion) =>
            onChange({ motion: motion as AtlasPreferences['motion'] })
          }
        >
          <SelectTrigger aria-labelledby="motion-label" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="system">System</SelectItem>
              <SelectItem value="reduced">Reduced</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-2 text-sm">
        <span id="density-label">Label density</span>
        <Select
          value={preferences.labelDensity}
          onValueChange={(labelDensity) =>
            onChange({
              labelDensity: labelDensity as AtlasPreferences['labelDensity'],
            })
          }
        >
          <SelectTrigger aria-labelledby="density-label" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="comfortable">Comfortable</SelectItem>
              <SelectItem value="compact">Compact</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <label className="flex min-h-11 items-center gap-3 text-sm">
        <Checkbox
          checked={preferences.compactPanels}
          onCheckedChange={(value) =>
            onChange({ compactPanels: value === true })
          }
        />
        Compact panels
      </label>
    </div>
  )
}

export function TopCommandBar(props: TopCommandBarProps) {
  const updateMode = (value: string) => {
    if (value) props.onModeChange(value as AtlasMode)
  }

  return (
    <TooltipProvider>
      <div className="flex h-full items-center gap-3 px-4">
        <span className="hidden font-serif text-xl tracking-wide lg:inline">
          Progression Atlas
        </span>
        <div className="atlas-game-selector mr-auto">
          <GameSelector
            value={props.gameSlug}
            games={props.games}
            onValueChange={props.onGameChange}
          />
        </div>
        {props.status ? (
          <div className="hidden xl:block">{props.status}</div>
        ) : null}
        <ToggleGroup
          className="atlas-mode-switch"
          type="single"
          value={props.mode}
          aria-label="Atlas view"
          onValueChange={updateMode}
        >
          <ToggleGroupItem value="map">Map</ToggleGroupItem>
          <ToggleGroupItem value="thread">Thread</ToggleGroupItem>
          <ToggleGroupItem value="timeline">Timeline</ToggleGroupItem>
        </ToggleGroup>
        <Button
          className="hidden lg:inline-flex"
          variant="secondary"
          onClick={props.onTraceStory}
        >
          Trace story
        </Button>
        <Button aria-label="Search" variant="outline" onClick={props.onSearch}>
          <Search data-icon="inline-start" aria-hidden="true" />
          <span className="hidden sm:inline">Search</span>
        </Button>
        <div className="hidden items-center gap-1 md:flex">
          <CommandIcon
            label="Layers"
            icon={<Layers3 aria-hidden="true" />}
            onClick={props.onLayers}
          />
          <CommandIcon
            label="Copy link"
            icon={<LinkIcon aria-hidden="true" />}
            onClick={props.onCopyLink}
          />
          <CommandIcon
            label="Zoom in"
            icon={<ZoomIn aria-hidden="true" />}
            onClick={props.onZoomIn}
          />
          <CommandIcon
            label="Zoom out"
            icon={<ZoomOut aria-hidden="true" />}
            onClick={props.onZoomOut}
          />
          <CommandIcon
            label="Reset view"
            icon={<RotateCcw aria-hidden="true" />}
            onClick={props.onResetView}
          />
          <Popover>
            <PopoverTrigger asChild>
              <Button
                size="icon-lg"
                variant="ghost"
                aria-label="Workspace preferences"
              >
                <Settings data-icon="icon" aria-hidden="true" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end">
              <PreferenceControls
                preferences={props.preferences}
                onChange={props.onPreferencesChange}
              />
            </PopoverContent>
          </Popover>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              className="md:hidden"
              size="icon-lg"
              variant="ghost"
              aria-label="More atlas controls"
            >
              <MoreHorizontal data-icon="icon" aria-hidden="true" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="flex flex-col gap-3">
            <GameSelector
              value={props.gameSlug}
              games={props.games}
              onValueChange={props.onGameChange}
            />
            <Button
              className="w-full justify-start"
              variant="ghost"
              onClick={props.onTraceStory}
            >
              Trace story
            </Button>
            <Button
              className="w-full justify-start"
              variant="ghost"
              onClick={props.onLayers}
            >
              <Layers3 data-icon="inline-start" aria-hidden="true" />
              Layers
            </Button>
            <Button
              className="w-full justify-start"
              variant="ghost"
              onClick={props.onCopyLink}
            >
              <LinkIcon data-icon="inline-start" aria-hidden="true" />
              Copy link
            </Button>
            <div className="grid grid-cols-3 gap-2">
              <Button
                size="icon-lg"
                variant="outline"
                aria-label="Zoom in"
                onClick={props.onZoomIn}
              >
                <ZoomIn data-icon="icon" aria-hidden="true" />
              </Button>
              <Button
                size="icon-lg"
                variant="outline"
                aria-label="Zoom out"
                onClick={props.onZoomOut}
              >
                <ZoomOut data-icon="icon" aria-hidden="true" />
              </Button>
              <Button
                size="icon-lg"
                variant="outline"
                aria-label="Reset view"
                onClick={props.onResetView}
              >
                <RotateCcw data-icon="icon" aria-hidden="true" />
              </Button>
            </div>
            <PreferenceControls
              preferences={props.preferences}
              onChange={props.onPreferencesChange}
            />
          </PopoverContent>
        </Popover>
      </div>
      <ToggleGroup
        className="portrait-mode-nav"
        type="single"
        value={props.mode}
        aria-label="Mobile atlas view"
        onValueChange={updateMode}
      >
        <ToggleGroupItem value="map">Map</ToggleGroupItem>
        <ToggleGroupItem value="thread">Thread</ToggleGroupItem>
        <ToggleGroupItem value="timeline">Timeline</ToggleGroupItem>
      </ToggleGroup>
    </TooltipProvider>
  )
}

function CommandIcon({
  label,
  icon,
  onClick,
}: {
  label: string
  icon: React.ReactElement
  onClick: () => void
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          size="icon-lg"
          variant="ghost"
          aria-label={label}
          onClick={onClick}
        >
          {icon}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}
