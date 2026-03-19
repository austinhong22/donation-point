import type { DemoActor } from '../../api/types';
import { formatRoleLabel } from '../../utils/actors';
import { formatActorDisplayName } from '../../utils/format';

interface ActorSwitcherProps {
  actors: DemoActor[];
  currentActorId: number | null;
  disabled?: boolean;
  onSelect: (actorId: number) => void;
}

export function ActorSwitcher({
  actors,
  currentActorId,
  disabled = false,
  onSelect,
}: ActorSwitcherProps) {
  return (
    <label className="actor-switcher">
      <span>역할 선택</span>
      <select
        value={currentActorId ?? ''}
        onChange={(event) => onSelect(Number(event.target.value))}
        disabled={disabled || actors.length === 0}
      >
        {actors.map((actor) => (
          <option key={actor.id} value={actor.id}>
            {formatActorDisplayName(actor.displayName)} · {formatRoleLabel(actor.role)}
          </option>
        ))}
      </select>
    </label>
  );
}
