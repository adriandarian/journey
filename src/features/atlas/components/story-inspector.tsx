import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import type { TraceModel } from '../map/trace-model'
import type { ContentPack } from '../model/schema'
import type { DerivedProgress } from '../progress/progress-engine'

export interface StoryInspectorProps {
  pack: ContentPack
  trace: TraceModel
  derived: DerivedProgress
  selectedStepId?: string
  selectedDiscoveryId?: string
  onSelect: (stepId: string) => void
  onComplete: (stepId: string) => void
  onChoose: (choiceGroup: string, stepId: string) => void
}

export function StoryInspector(props: StoryInspectorProps) {
  const [confirmChoice, setConfirmChoice] = useState(false)
  const index = props.trace.nodes.findIndex(
    (node) => node.id === props.selectedStepId,
  )
  const node = props.trace.nodes.find((item) => item.id === props.selectedStepId)
  const step = props.pack.steps.find((item) => item.id === node?.id)

  if (!node || !step) {
    return <p className="p-4 text-muted-foreground">Select a story step.</p>
  }

  const incoming = props.pack.edges.filter((edge) => edge.to === step.id)
  const rewards = props.pack.rewards.filter((reward) =>
    step.rewardIds.includes(reward.id),
  )
  const discoveries = props.pack.discoveries.filter((item) =>
    item.relevantStepIds.includes(step.id),
  )
  const selectedDiscovery = props.pack.discoveries.find(
    (item) => item.id === props.selectedDiscoveryId,
  )
  const source = props.pack.sources.find(
    (item) => item.id === (selectedDiscovery?.sourceId ?? step.sourceId),
  )
  const choice = incoming.find(
    (edge) => edge.kind === 'choice' && edge.choiceGroup,
  )
  const excludedTitles = choice?.choiceGroup
    ? props.pack.edges
        .filter(
          (edge) =>
            edge.kind === 'choice' &&
            edge.choiceGroup === choice.choiceGroup &&
            edge.to !== step.id,
        )
        .map(
          (edge) => props.pack.steps.find((item) => item.id === edge.to)?.title,
        )
        .filter((title): title is string => Boolean(title))
    : []

  return (
    <div className="flex h-full flex-col gap-4 overflow-auto p-5">
      <div className="flex flex-col gap-2">
        <p className="text-xs tracking-widest text-primary uppercase">
          Main story
        </p>
        <h2 className="font-serif text-3xl">
          {selectedDiscovery?.title ?? step.title}
        </h2>
        <p className="text-muted-foreground">
          {selectedDiscovery
            ? `Discovery linked to ${step.title}.`
            : step.summary}
        </p>
      </div>
      <p>
        <strong>Status:</strong> {props.derived.states[step.id]}
      </p>
      <p>
        <strong>Source confidence:</strong> {source?.confidence ?? 'unverified'}
      </p>
      {source ? (
        <details>
          <summary>Source details</summary>
          <div className="flex flex-col gap-1 pt-2 text-sm text-muted-foreground">
            <p>{source.reference}</p>
            <p>Contributor: {source.contributor}</p>
            <p>
              Verified: {source.verifiedAt} · Content version{' '}
              {source.contentVersion}
            </p>
            <p>Permission: {source.permission}</p>
          </div>
        </details>
      ) : null}
      <Separator />
      <section
        aria-labelledby="prerequisites-title"
        className="flex flex-col gap-2"
      >
        <h3 id="prerequisites-title" className="font-medium">
          Prerequisites
        </h3>
        {incoming.length > 0 ? (
          <ul className="list-inside list-disc text-sm text-muted-foreground">
            {incoming.map((edge) => (
              <li key={edge.id}>
                {edge.kind}: {edge.from}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">Opening step</p>
        )}
      </section>
      <section aria-labelledby="rewards-title" className="flex flex-col gap-2">
        <h3 id="rewards-title" className="font-medium">
          Rewards
        </h3>
        <ul className="text-sm text-muted-foreground">
          {rewards.length > 0 ? (
            rewards.map((reward) => <li key={reward.id}>{reward.title}</li>)
          ) : (
            <li>No recorded reward</li>
          )}
        </ul>
      </section>
      <section
        aria-labelledby="discoveries-title"
        className="flex flex-col gap-2"
      >
        <h3 id="discoveries-title" className="font-medium">
          Nearby discoveries
        </h3>
        <ul className="text-sm text-muted-foreground">
          {discoveries.length > 0 ? (
            discoveries.map((item) => <li key={item.id}>{item.title}</li>)
          ) : (
            <li>No linked discoveries</li>
          )}
        </ul>
      </section>
      <div className="mt-auto flex flex-wrap gap-2 pt-2">
        <Button
          variant="outline"
          disabled={index <= 0}
          onClick={() => props.onSelect(props.trace.nodes[index - 1].id)}
        >
          Previous
        </Button>
        {node.state === 'available' || node.state === 'current' ? (
          <Button onClick={() => props.onComplete(node.id)}>
            Complete step
          </Button>
        ) : null}
        {choice?.choiceGroup &&
        (node.state === 'available' || node.state === 'current') ? (
          <Button variant="outline" onClick={() => setConfirmChoice(true)}>
            Choose branch
          </Button>
        ) : null}
        <Button
          variant="outline"
          disabled={index >= props.trace.nodes.length - 1}
          onClick={() => props.onSelect(props.trace.nodes[index + 1].id)}
        >
          Next
        </Button>
      </div>
      <Dialog open={confirmChoice} onOpenChange={setConfirmChoice}>
        <DialogContent>
          <DialogTitle>Choose this branch?</DialogTitle>
          <DialogDescription>
            Choosing {step.title} excludes{' '}
            {excludedTitles.join(', ') || 'the other route'} in this choice
            group.
          </DialogDescription>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmChoice(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (choice?.choiceGroup) {
                  props.onChoose(choice.choiceGroup, node.id)
                }
                setConfirmChoice(false)
              }}
            >
              Confirm choice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
