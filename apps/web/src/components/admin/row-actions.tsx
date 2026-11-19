import { MoreHorizontal } from 'lucide-react'
import { Dropdown, DropdownContent, DropdownItem, DropdownSeparator, DropdownTrigger } from '#/components/ui/dropdown'

export type RowAction =
  | { label: string; icon?: React.ComponentType; onSelect: () => void; danger?: boolean; hidden?: boolean }
  | 'separator'

/** The "⋯" menu at the end of a table row. */
export function RowActions({ actions, label = 'Actions' }: { actions: Array<RowAction>; label?: string }) {
  const visible = actions.filter((a) => a === 'separator' || !a.hidden)
  if (!visible.some((a) => a !== 'separator')) return null
  return (
    <Dropdown>
      <DropdownTrigger
        className="ml-auto flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground data-[state=open]:bg-accent"
        aria-label={label}
      >
        <MoreHorizontal className="size-4" />
      </DropdownTrigger>
      <DropdownContent className="w-52">
        {visible.map((a, i) =>
          a === 'separator' ? (
            <DropdownSeparator key={`s${i}`} />
          ) : (
            <DropdownItem key={a.label} danger={a.danger} onSelect={a.onSelect}>
              {a.icon && <a.icon />} {a.label}
            </DropdownItem>
          ),
        )}
      </DropdownContent>
    </Dropdown>
  )
}
