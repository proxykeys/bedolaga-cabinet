import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PreviewSection } from '../components/PreviewSection';
import { Snapshot } from '../components/Snapshot';
import { Button } from '@/components/primitives/Button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/data-display/Card';
import { StatCard } from '@/components/data-display/StatCard';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/primitives/Dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/primitives/Sheet';
import { Select, SelectTrigger, SelectContent, SelectItem } from '@/components/primitives/Select';
import { Switch } from '@/components/primitives/Switch';
import { SimpleTooltip } from '@/components/primitives/Tooltip';
import { Skeleton, SkeletonGroup } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/Spinner';
import { CardIcon, ChevronRightIcon, CheckIcon, UsersIcon, CloseIcon } from '@/components/icons';

export function PrimitivesSection() {
  return (
    <PreviewSection
      id="primitives"
      title="Primitives"
      badge="phase 5"
      description="Базовые UI-компоненты: кнопки, карточки, диалоги, шиты, селекты, переключатели, тултипы, скелетоны"
    >
      {/* ─── Button ─── */}
      <SubGroup
        title="Button"
        hint="6 variants × sizes × states (default, disabled, loading, icons)"
      >
        <Snapshot
          label="button · variants"
          description="primary, secondary, ghost, destructive, outline, link"
        >
          <div className="flex flex-wrap items-center gap-3 rounded-xl bg-gray-050 p-6 dark:bg-gray-950">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="link">Link</Button>
          </div>
        </Snapshot>

        <Snapshot label="button · sizes" description="sm, md, lg, icon, icon-sm, icon-lg">
          <div className="flex flex-wrap items-center gap-3 rounded-xl bg-gray-050 p-6 dark:bg-gray-950">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
            <Button size="icon" variant="secondary">
              <CheckIcon className="h-4 w-4" />
            </Button>
            <Button size="icon-sm" variant="secondary">
              <CloseIcon className="h-3 w-3" />
            </Button>
            <Button size="icon-lg" variant="secondary">
              <ChevronRightIcon className="h-5 w-5" />
            </Button>
          </div>
        </Snapshot>

        <Snapshot label="button · states" description="default, disabled, loading">
          <div className="flex flex-wrap items-center gap-3 rounded-xl bg-gray-050 p-6 dark:bg-gray-950">
            <Button>Default</Button>
            <Button disabled>Disabled</Button>
            <Button loading>Loading</Button>
            <Button leftIcon={<CheckIcon className="h-4 w-4" />}>With icon</Button>
            <Button variant="secondary" rightIcon={<ChevronRightIcon className="h-4 w-4" />}>
              Next
            </Button>
            <Button fullWidth>Full width</Button>
          </div>
        </Snapshot>
      </SubGroup>

      {/* ─── Card ─── */}
      <SubGroup
        title="Card"
        hint="variants (default, glass, solid, outline) + sizes + interactive + glow"
      >
        <Snapshot label="card · default lg" description="стандартная glassmorphic карточка">
          <div className="rounded-xl bg-gray-050 p-6 dark:bg-gray-950">
            <Card size="lg">
              <CardHeader>
                <CardTitle>Заголовок карточки</CardTitle>
                <CardDescription>Описание под заголовком</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-dark-400">Содержимое карточки — основной контент.</p>
              </CardContent>
              <CardFooter>
                <Button size="sm">Действие</Button>
              </CardFooter>
            </Card>
          </div>
        </Snapshot>

        <Snapshot label="card · glass sm" description="компактная glass-карточка">
          <div className="rounded-xl bg-gray-050 p-6 dark:bg-gray-950">
            <Card size="sm" variant="glass">
              <CardContent className="flex items-center gap-3">
                <p className="text-sm text-dark-100">Glass compact</p>
              </CardContent>
            </Card>
          </div>
        </Snapshot>

        <Snapshot label="card · solid md" description="непрозрачная solid-карточка">
          <div className="rounded-xl bg-gray-050 p-6 dark:bg-gray-950">
            <Card size="md" variant="solid">
              <CardContent>
                <p className="text-sm text-dark-100">Solid card (bg-gray-100 dark:bg-gray-900)</p>
              </CardContent>
            </Card>
          </div>
        </Snapshot>

        <Snapshot label="card · outline md" description="только рамка, прозрачный фон">
          <div className="rounded-xl bg-gray-050 p-6 dark:bg-gray-950">
            <Card size="md" variant="outline">
              <CardContent>
                <p className="text-sm text-dark-100">Outline card (transparent)</p>
              </CardContent>
            </Card>
          </div>
        </Snapshot>

        <Snapshot label="card · xl" description="максимальный padding">
          <div className="rounded-xl bg-gray-050 p-6 dark:bg-gray-950">
            <Card size="xl">
              <CardHeader>
                <CardTitle>Extra Large Card</CardTitle>
                <CardDescription>size=xl: padding 6/8 (sm)</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-dark-400">Максимальный padding для крупных секций.</p>
              </CardContent>
            </Card>
          </div>
        </Snapshot>

        <Snapshot label="card · interactive glow" description="кликабельная с glow-эффектом">
          <div className="rounded-xl bg-gray-050 p-6 dark:bg-gray-950">
            <Card size="md" interactive glow>
              <CardContent className="flex items-center gap-3">
                <CardIcon className="h-6 w-6 text-accent-500" />
                <div>
                  <p className="font-semibold text-dark-50">Interactive glow card</p>
                  <p className="text-xs text-dark-400">Наведи курсор</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </Snapshot>
      </SubGroup>

      {/* ─── StatCard ─── */}
      <SubGroup
        title="StatCard"
        hint="trend variants (up, down, neutral) + loading + change indicators"
      >
        <Snapshot label="statcard · gallery" description="up, down, neutral, loading">
          <div className="grid grid-cols-2 gap-2.5 rounded-xl bg-gray-050 p-6 dark:bg-gray-950">
            <StatCard
              label="Баланс"
              value="1 500 ₽"
              icon={<CardIcon className="h-5 w-5" />}
              change={{ value: 12, label: 'за месяц' }}
              trend="up"
            />
            <StatCard
              label="Рефералы"
              value="24"
              icon={<UsersIcon className="h-5 w-5" />}
              change={{ value: -5, label: 'за неделю' }}
              trend="down"
            />
            <StatCard label="Загрузка" value="—" icon={<CardIcon className="h-5 w-5" />} loading />
            <StatCard
              label="Ноль"
              value="0 ₽"
              icon={<UsersIcon className="h-5 w-5" />}
              trend="neutral"
            />
          </div>
        </Snapshot>
      </SubGroup>

      {/* ─── Dialog ─── */}
      <SubGroup title="Dialog" hint="модальное окно. Нажми кнопку чтобы открыть">
        <Snapshot label="dialog · trigger" description="нажми чтобы открыть диалог">
          <div className="rounded-xl bg-gray-050 p-6 dark:bg-gray-950">
            <DialogDemo />
          </div>
        </Snapshot>
      </SubGroup>

      {/* ─── Sheet ─── */}
      <SubGroup title="Sheet" hint="bottom sheet. Нажми кнопку чтобы открыть">
        <Snapshot label="sheet · trigger" description="нажми чтобы открыть bottom sheet">
          <div className="rounded-xl bg-gray-050 p-6 dark:bg-gray-950">
            <SheetDemo />
          </div>
        </Snapshot>
      </SubGroup>

      {/* ─── Select ─── */}
      <SubGroup title="Select" hint="dropdown select. Нажми чтобы развернуть">
        <Snapshot label="select · demo" description="нажми чтобы выбрать">
          <div className="rounded-xl bg-gray-050 p-6 dark:bg-gray-950">
            <SelectDemo />
          </div>
        </Snapshot>
      </SubGroup>

      {/* ─── Switch ─── */}
      <SubGroup title="Switch" hint="on / off / disabled + label + description">
        <Snapshot label="switch · gallery" description="все состояния">
          <div className="space-y-4 rounded-xl bg-gray-050 p-6 dark:bg-gray-950">
            <Switch
              label="Автопродление"
              description="Автоматически продлевать подписку"
              defaultChecked
            />
            <Switch label="Уведомления" description="Получать push-уведомления" />
            <Switch label="Заблокировано" description="Недоступно для изменения" disabled />
            <Switch label="Заблокировано вкл" disabled defaultChecked />
          </div>
        </Snapshot>
      </SubGroup>

      {/* ─── Tooltip ─── */}
      <SubGroup title="Tooltip" hint="наведи на элементы">
        <Snapshot label="tooltip · gallery" description="наведи курсор">
          <div className="flex flex-wrap items-center gap-4 rounded-xl bg-gray-050 p-6 dark:bg-gray-950">
            <SimpleTooltip content="Тултип сверху">
              <Button variant="secondary" size="sm">
                Top
              </Button>
            </SimpleTooltip>
            <SimpleTooltip content="Тултип справа" side="right">
              <Button variant="secondary" size="sm">
                Right
              </Button>
            </SimpleTooltip>
            <SimpleTooltip content="Тултип снизу" side="bottom">
              <Button variant="secondary" size="sm">
                Bottom
              </Button>
            </SimpleTooltip>
            <SimpleTooltip content="Тултип слева" side="left">
              <Button variant="secondary" size="sm">
                Left
              </Button>
            </SimpleTooltip>
          </div>
        </Snapshot>
      </SubGroup>

      {/* ─── Skeleton ─── */}
      <SubGroup title="Skeleton" hint="variants: line, card, circle, SkeletonGroup">
        <Snapshot label="Skeleton · gallery" description="варианты скелетонов (1.67 API)">
          <div className="space-y-5 rounded-xl bg-gray-050 p-6 dark:bg-gray-950">
            {/* Line */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/5" />
              <Skeleton className="h-4 w-2/5" />
            </div>
            {/* Circle + lines */}
            <div className="flex items-center gap-3">
              <Skeleton circle className="h-10 w-10" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
            {/* Card variant */}
            <Skeleton variant="card" className="h-24" />
            {/* SkeletonGroup (space-y) */}
            <SkeletonGroup className="space-y-2">
              <Skeleton variant="card" count={2} className="h-14" />
            </SkeletonGroup>
          </div>
        </Snapshot>
      </SubGroup>

      {/* ─── Spinner ─── */}
      <SubGroup title="Spinner" hint="размеры спиннера">
        <Snapshot label="spinner · gallery" description="разные размеры">
          <div className="flex items-center gap-6 rounded-xl bg-gray-050 p-6 dark:bg-gray-950">
            <Spinner className="h-4 w-4 text-accent-500" />
            <Spinner className="h-6 w-6 text-accent-500" />
            <Spinner className="h-8 w-8 text-accent-500" />
            <Spinner className="h-12 w-12 text-accent-500" />
          </div>
        </Snapshot>
      </SubGroup>
    </PreviewSection>
  );
}

/** Interactive Dialog demo */
function DialogDemo() {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <>
      <Button onClick={() => setOpen(true)}>Открыть диалог</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Подтверждение</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите выполнить это действие? Это действие нельзя отменить.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              {t('common.cancel', 'Отмена')}
            </Button>
            <Button variant="destructive" onClick={() => setOpen(false)}>
              Удалить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

/** Interactive Sheet demo */
function SheetDemo() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Открыть sheet
      </Button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Bottom Sheet</SheetTitle>
            <SheetDescription>Содержимое выезжающей панели снизу экрана.</SheetDescription>
          </SheetHeader>
          <div className="px-4 py-3">
            <p className="text-sm text-dark-400">
              Здесь располагается контент шита. Можно добавить формы, списки и любые другие
              элементы.
            </p>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

/** Interactive Select demo */
function SelectDemo() {
  const [value, setValue] = useState('');

  return (
    <div className="w-full max-w-xs">
      <Select value={value} onValueChange={setValue}>
        <SelectTrigger placeholder="Выберите период" />
        <SelectContent>
          <SelectItem value="30">30 дней</SelectItem>
          <SelectItem value="90">90 дней</SelectItem>
          <SelectItem value="180">180 дней</SelectItem>
          <SelectItem value="360">360 дней</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

function SubGroup({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-8">
      <div className="mb-3 flex items-baseline gap-2 border-b border-dark-50/5 pb-2">
        <h3 className="font-mono text-[13px] font-semibold uppercase tracking-wider text-dark-50/70">
          {title}
        </h3>
        {hint && <span className="text-[11px] text-dark-50/30">{hint}</span>}
      </div>
      <div className="flex flex-col gap-5">{children}</div>
    </div>
  );
}
