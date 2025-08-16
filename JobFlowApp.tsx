'use client';
import React, { useEffect, useMemo, useState } from "react";
import { format, isBefore, isSameDay, parseISO } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar as CalendarIcon, Clock, Plus, Trash2, CheckCircle2, Filter as FilterIcon, LayoutGrid, Rows, Search as SearchIcon, ChevronRight, ChevronLeft, Bell, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toggle } from "@/components/ui/toggle";
import { Checkbox } from "@/components/ui/checkbox";

type Person = { id: string, name: string, role?: string, email?: string };
type Task = { id: string, title: string, done: boolean, assigneeId?: string, dueDate?: string };
type Job = { id: string, title: string, client: string, description?: string, status: 'Backlog'|'In Progress'|'Review'|'Done', priority: 'Low'|'Medium'|'High'|'Urgent', dueDate?: string, ownerId?: string, assigneeIds: string[], tasks: Task[] };

const DEMO_PEOPLE: Person[] = [
  { id: "p1", name: "Feras Shoujah", role: "Director" },
  { id: "p2", name: "Aisha", role: "Designer" },
  { id: "p3", name: "Omar", role: "Copywriter" },
  { id: "p4", name: "Lina", role: "Motion" },
  { id: "p5", name: "Samir", role: "Media" },
  { id: "p6", name: "Rami", role: "Accounts" },
];

const seedJobs = (): Job[] => ([
  {
    id: crypto.randomUUID(),
    title: "Indomie – Japan Flavor Launch",
    client: "Indomie Saudi",
    description: "Social big idea + content calendar",
    status: "In Progress",
    priority: "Urgent",
    dueDate: new Date(Date.now() + 1000*60*60*24*7).toISOString(),
    ownerId: "p1",
    assigneeIds: ["p2","p3","p4"],
    tasks: [
      { id: crypto.randomUUID(), title: "Key visual concepts", done: false, assigneeId: "p2", dueDate: new Date(Date.now()+1000*60*60*24*2).toISOString() },
      { id: crypto.randomUUID(), title: "Copy & captions", done: false, assigneeId: "p3", dueDate: new Date(Date.now()+1000*60*60*24*3).toISOString() },
      { id: crypto.randomUUID(), title: "Animation storyboard", done: false, assigneeId: "p4", dueDate: new Date(Date.now()+1000*60*60*24*4).toISOString() },
    ],
  },
  {
    id: crypto.randomUUID(),
    title: "Fakieh – Packaging Revamp",
    client: "Fakieh Poultry",
    description: "Revamp packaging system",
    status: "Backlog",
    priority: "High",
    dueDate: new Date(Date.now() + 1000*60*60*24*14).toISOString(),
    ownerId: "p1",
    assigneeIds: ["p2","p6"],
    tasks: [
      { id: crypto.randomUUID(), title: "dielines audit", done: false, assigneeId: "p2" },
      { id: crypto.randomUUID(), title: "client workshop plan", done: false, assigneeId: "p6" },
    ],
  },
]);

const statusColors: Record<string,string> = {
  Backlog: "bg-gray-100 text-gray-700",
  "In Progress": "bg-blue-100 text-blue-700",
  Review: "bg-amber-100 text-amber-700",
  Done: "bg-emerald-100 text-emerald-700",
};

const priorityColors: Record<string,string> = {
  Low: "bg-zinc-100 text-zinc-700",
  Medium: "bg-sky-100 text-sky-700",
  High: "bg-orange-100 text-orange-700",
  Urgent: "bg-red-100 text-red-700",
};

const priorityOrder: Record<string, number> = { Low: 0, Medium: 1, High: 2, Urgent: 3 };

function PersonBadge({ id, people }: {id: string, people: Person[]}){
  const p = people.find(x=>x.id===id); if(!p) return null;
  return <Badge variant="secondary" className="mr-1">{p.name.split(" ")[0]}</Badge>;
}
function StatusBadge({ status }: {status: Job['status']}){
  return <span className={`px-2 py-1 rounded-full text-xs ${statusColors[status]}`}>{status}</span>;
}
function PriorityBadge({ priority }: {priority?: Job['priority']}){
  const p = priority || 'Medium';
  return <span className={`px-2 py-1 rounded-full text-xs ${priorityColors[p]}`}>{p}</span>;
}

function EmptyState({ title, subtitle, cta }: any){
  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{subtitle}</CardDescription>
      </CardHeader>
      <CardContent>{cta}</CardContent>
    </Card>
  );
}

export default function JobFlowApp(){
  const [people] = useState<Person[]>(DEMO_PEOPLE);
  const [jobs, setJobs] = useState<Job[]>(()=> {
    try { const raw = localStorage.getItem("jobflow-state"); if(raw){ return JSON.parse(raw).jobs as Job[]; } } catch {}
    return seedJobs();
  });
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"board"|"list"|"calendar">("board");
  const [selectedJob, setSelectedJob] = useState<Job|null>(null);
  const [filterAssignee, setFilterAssignee] = useState<string>("all");
  const [showOnlyDueToday, setShowOnlyDueToday] = useState(false);

  useEffect(()=> { try { localStorage.setItem("jobflow-state", JSON.stringify({jobs})); } catch {} }, [jobs]);

  const filteredJobs = useMemo(()=>{
    let out = jobs.filter(j => j.title.toLowerCase().includes(query.toLowerCase()) || j.client.toLowerCase().includes(query.toLowerCase()));
    if (filterAssignee !== "all") out = out.filter(j => j.assigneeIds.includes(filterAssignee));
    if (showOnlyDueToday) out = out.filter(j => j.dueDate && isSameDay(parseISO(j.dueDate), new Date()));
    return out;
  }, [jobs, query, filterAssignee, showOnlyDueToday]);

  const columns: Job['status'][] = ["Backlog","In Progress","Review","Done"];

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white p-6">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">JobFlow</h1>
            <p className="text-sm text-muted-foreground">A lightweight pipeline, tasks & reminders app for remote teams</p>
          </div>
          <div className="flex items-center gap-2">
            <Input placeholder="Search jobs or clients" value={query} onChange={e=>setQuery(e.target.value)} className="w-64" />
            <AssigneeFilter people={people} value={filterAssignee} onChange={setFilterAssignee} />
            <Toggle pressed={showOnlyDueToday} onPressedChange={setShowOnlyDueToday} className="ml-1"><Clock className="h-4 w-4 mr-1"/>Today</Toggle>
            <ViewToggle view={view} setView={setView} />
            <NewJobDialog people={people} onCreate={(job: Job)=> setJobs(j=>[job, ...j])} />
          </div>
        </header>

        <div className="mb-4">
          <SimpleTabs value={view} onChange={setView} />
        </div>

        {view === "board" && <KanbanBoard jobs={filteredJobs} setJobs={setJobs} people={people} onOpenJob={setSelectedJob} columns={columns} />}
        {view === "list" && <JobList jobs={filteredJobs} people={people} onOpenJob={setSelectedJob} />}
        {view === "calendar" && <CalendarStub jobs={filteredJobs} />}

        <AnimatePresence>
          {selectedJob && (
            <JobDrawer job={selectedJob} setJob={(updated)=> setJobs(js=> js.map(j=> j.id===updated.id? updated : j))} onClose={()=> setSelectedJob(null)} people={people} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function SimpleTabs({value, onChange}:{value:"board"|"list"|"calendar", onChange:(v:any)=>void}){
  return (
    <div className="flex items-center gap-2">
      <Button variant={value==='board'?'default':'outline'} onClick={()=> onChange('board')}><LayoutGrid className="h-4 w-4 mr-2"/>Board</Button>
      <Button variant={value==='list'?'default':'outline'} onClick={()=> onChange('list')}><Rows className="h-4 w-4 mr-2"/>List</Button>
      <Button variant={value==='calendar'?'default':'outline'} onClick={()=> onChange('calendar')}><CalendarIcon className="h-4 w-4 mr-2"/>Calendar</Button>
    </div>
  );
}

function ViewToggle({ view, setView }:{view:string, setView:(v:any)=>void}){
  return (
    <Button variant="outline"><FilterIcon className="h-4 w-4 mr-2"/>{view === "board" ? "Board" : view === "list" ? "List" : "Calendar"}</Button>
  );
}

function AssigneeFilter({ people, value, onChange }:{people:Person[], value:string, onChange:(v:string)=>void}){
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline"><UserPlus className="h-4 w-4 mr-2"/>{value === 'all' ? 'All team' : people.find(p=>p.id===value)?.name.split(' ')[0]}</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Filter by assignee</DropdownMenuLabel>
        <DropdownMenuItem onClick={()=>onChange('all')}>All</DropdownMenuItem>
        <DropdownMenuSeparator/>
        {people.map(p=> (
          <DropdownMenuItem key={p.id} onClick={()=>onChange(p.id)}>{p.name}</DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function KanbanBoard({ jobs, setJobs, people, onOpenJob, columns }:{jobs:Job[], setJobs:any, people:Person[], onOpenJob:(j:Job)=>void, columns:Job['status'][]}){
  const grouped = columns.reduce((acc:any, col)=> ({...acc, [col]: [] as Job[]}), {} as any);
  jobs.forEach(j=> (grouped[j.status] as Job[]).push(j));
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
      {columns.map((status)=> {
        const items = (grouped[status] as Job[]).slice().sort((a,b)=> (priorityOrder[b.priority||'Medium'] - priorityOrder[a.priority||'Medium']));
        return (
          <Card key={status} className="shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{status}</CardTitle>
                <Badge variant="secondary" className="rounded-full">{items.length}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {items.length===0 && <p className="text-sm text-muted-foreground">No jobs</p>}
                {items.map(job=> (
                  <motion.div key={job.id} initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0}}>
                    <JobCard job={job} people={people} onClick={()=> onOpenJob(job)} onStatusChange={(newStatus)=> setJobs((js:Job[])=> js.map(j=> j.id===job.id? {...j, status:newStatus}: j))} />
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function JobCard({ job, people, onClick, onStatusChange }:{job:Job, people:Person[], onClick:()=>void, onStatusChange:(s:Job['status'])=>void}){
  const overdue = job.dueDate && isBefore(parseISO(job.dueDate), new Date()) && job.status !== 'Done';
  return (
    <div className="cursor-pointer rounded-2xl border bg-white p-3 hover:shadow" onClick={onClick}>
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold leading-tight">{job.title}</h3>
          <p className="text-xs text-muted-foreground">{job.client}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <StatusBadge status={job.status} />
          <PriorityBadge priority={job.priority} />
        </div>
      </div>
      {job.description && <p className="mt-2 line-clamp-2 text-sm">{job.description}</p>}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex flex-wrap items-center gap-1">
          {job.assigneeIds.map(id=> <PersonBadge key={id} id={id} people={people} />)}
        </div>
        <div className="flex items-center gap-2">
          {job.dueDate && (
            <span className={`rounded-full px-2 py-1 text-xs ${overdue? 'bg-red-100 text-red-700':'bg-zinc-100 text-zinc-700'}`}>
              <Clock className="inline mr-1 h-3 w-3" /> {format(parseISO(job.dueDate), 'MMM d')}
            </span>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost" className="h-8 w-8">⋯</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={()=> onStatusChange('Backlog')}>Move to Backlog</DropdownMenuItem>
              <DropdownMenuItem onClick={()=> onStatusChange('In Progress')}>Move to In Progress</DropdownMenuItem>
              <DropdownMenuItem onClick={()=> onStatusChange('Review')}>Move to Review</DropdownMenuItem>
              <DropdownMenuItem onClick={()=> onStatusChange('Done')}>Move to Done</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}

function JobList({ jobs, people, onOpenJob }:{jobs:Job[], people:Person[], onOpenJob:(j:Job)=>void}){
  if (jobs.length===0) return <EmptyState title="No jobs match" subtitle="Adjust filters or create a new job." cta={<NewJobDialog people={people} onCreate={()=>{}}/>} />;
  const ordered = jobs.slice().sort((a,b)=> (priorityOrder[b.priority||'Medium'] - priorityOrder[a.priority||'Medium']));
  return (
    <div className="grid gap-3">
      {ordered.map(j=> (
        <div key={j.id} className="flex items-center justify-between rounded-2xl border bg-white p-3 hover:shadow">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="truncate font-semibold">{j.title}</h3>
              <StatusBadge status={j.status} />
              <PriorityBadge priority={j.priority} />
            </div>
            <p className="text-xs text-muted-foreground">{j.client}</p>
            {j.description && <p className="mt-1 line-clamp-2 text-sm">{j.description}</p>}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex max-w-[200px] flex-wrap items-center gap-1">
              {j.assigneeIds.map(id=> <PersonBadge key={id} id={id} people={people} />)}
            </div>
            {j.dueDate && <span className="rounded-full bg-zinc-100 px-2 py-1 text-xs text-zinc-700"><Clock className="inline mr-1 h-3 w-3" />{format(parseISO(j.dueDate), 'MMM d')}</span>}
            <Button variant="outline" onClick={()=> onOpenJob(j)}>Open</Button>
          </div>
        </div>
      ))}
    </div>
  );
}

function CalendarStub({ jobs }:{jobs:Job[]}){
  const [monthOffset, setMonthOffset] = useState(0);
  const now = new Date();
  const target = new Date(now.getFullYear(), now.getMonth()+monthOffset, 1);
  const monthJobs = jobs.filter(j=> j.dueDate && new Date(j.dueDate).getMonth() === target.getMonth());
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{format(target, 'MMMM yyyy')}</CardTitle>
          <CardDescription>Jobs grouped by due date</CardDescription>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={()=> setMonthOffset(x=>x-1)}><ChevronLeft className="h-4 w-4"/></Button>
          <Button variant="outline" onClick={()=> setMonthOffset(x=>x+1)}><ChevronRight className="h-4 w-4"/></Button>
        </div>
      </CardHeader>
      <CardContent>
        {monthJobs.length===0 ? (
          <p className="text-sm text-muted-foreground">No jobs this month.</p>
        ) : (
          <div className="space-y-2">
            {monthJobs.sort((a,b)=> new Date(a.dueDate!).getTime()-new Date(b.dueDate!).getTime()).map(j=> (
              <div key={j.id} className="flex items-center justify-between rounded-xl border p-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{j.title} <span className="text-xs text-muted-foreground">• {j.client}</span></p>
                  <div className="text-xs text-muted-foreground">{j.tasks.filter(t=>!t.done).length} open tasks</div>
                </div>
                <div className="rounded-full bg-zinc-100 px-2 py-1 text-xs">{format(parseISO(j.dueDate!), 'MMM d')}</div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function JobDrawer({ job, setJob, onClose, people }:{job:Job, setJob:(j:Job)=>void, onClose:()=>void, people:Person[]}){
  const [local, setLocal] = useState<Job>(job);
  useEffect(()=> setLocal(job), [job]);

  const addTask = () => setLocal(l=> ({...l, tasks: [...l.tasks, { id: crypto.randomUUID(), title: "New task", done: false }]}));
  const removeTask = (id: string) => setLocal(l=> ({...l, tasks: l.tasks.filter(t=> t.id!==id)}));
  const toggleDone = (id: string) => setLocal(l=> ({...l, tasks: l.tasks.map(t=> t.id===id? {...t, done: !t.done} : t)}));

  const save = () => { setJob(local); onClose(); };

  return (
    <Dialog open onOpenChange={(v:boolean)=> { if(!v) onClose(); }}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Edit Job</span>
            <div className="flex flex-col items-end gap-1">
              <StatusBadge status={local.status} />
              <PriorityBadge priority={local.priority} />
            </div>
          </DialogTitle>
          <DialogDescription>Update details, assignees, tasks, dates, and status.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <div>
              <Label>Title</Label>
              <Input value={local.title} onChange={e=> setLocal({...local, title: (e.target as any).value})} />
            </div>
            <div>
              <Label>Client</Label>
              <Input value={local.client} onChange={e=> setLocal({...local, client: (e.target as any).value})} />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea rows={4} value={local.description ?? ''} onChange={e=> setLocal({...local, description: (e.target as any).value})} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Due date</Label>
                <Input type="date" value={local.dueDate? format(parseISO(local.dueDate), 'yyyy-MM-dd') : ''} onChange={e=> setLocal({...local, dueDate: (e.target as any).value? new Date((e.target as any).value).toISOString(): undefined})} />
              </div>
              <div>
                <Label>Status</Label>
                <select className="h-9 w-full rounded-md border px-3" value={local.status} onChange={e=> setLocal({...local, status: (e.target as any).value as Job['status']})}>
                  <option>Backlog</option>
                  <option>In Progress</option>
                  <option>Review</option>
                  <option>Done</option>
                </select>
              </div>
              <div>
                <Label>Priority</Label>
                <select className="h-9 w-full rounded-md border px-3" value={local.priority ?? 'Medium'} onChange={e=> setLocal({...local, priority: (e.target as any).value as Job['priority']})}>
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                  <option>Urgent</option>
                </select>
              </div>
            </div>
            <div>
              <Label>Assignees</Label>
              <div className="mt-1 flex flex-wrap gap-2">
                {people.map(p=> (
                  <label key={p.id} className="flex items-center gap-2 rounded-full border px-3 py-1 text-sm">
                    <Checkbox checked={local.assigneeIds.includes(p.id)} onCheckedChange={(v:boolean)=> setLocal(l=> ({...l, assigneeIds: v? [...l.assigneeIds, p.id] : l.assigneeIds.filter(id=> id!==p.id)}))} />
                    {p.name}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Tasks</Label>
              <Button onClick={addTask}><Plus className="mr-1 h-4 w-4"/>Add</Button>
            </div>
            <div className="max-h-72 space-y-2 overflow-auto pr-1">
              {local.tasks.map(t=> (
                <div key={t.id} className="rounded-xl border p-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox checked={t.done} onCheckedChange={()=> toggleDone(t.id)} />
                      <Input value={t.title} onChange={e=> setLocal(l=> ({...l, tasks: l.tasks.map(x=> x.id===t.id? {...x, title: (e.target as any).value}: x)}))} className="h-8" />
                    </div>
                    <div className="flex items-center gap-2">
                      <select className="h-8 rounded-md border px-2 text-sm" value={t.assigneeId ?? ''} onChange={e=> setLocal(l=> ({...l, tasks: l.tasks.map(x=> x.id===t.id? {...x, assigneeId: (e.target as any).value || undefined}: x)}))}>
                        <option value="">Unassigned</option>
                        {people.map(p=> <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                      <Input type="date" className="h-8" value={t.dueDate? format(parseISO(t.dueDate), 'yyyy-MM-dd'): ''} onChange={e=> setLocal(l=> ({...l, tasks: l.tasks.map(x=> x.id===t.id? {...x, dueDate: (e.target as any).value? new Date((e.target as any).value).toISOString(): undefined}: x)}))} />
                      <Button variant="ghost" onClick={()=> removeTask(t.id)}><Trash2 className="h-4 w-4"/></Button>
                    </div>
                  </div>
                </div>
              ))}
              {local.tasks.length===0 && <p className="text-sm text-muted-foreground">No tasks yet.</p>}
            </div>
            <div className="pt-2">
              <Label>Quick reminder</Label>
              <p className="mb-2 text-xs text-muted-foreground">Notifies the assignees when a task is due today (MVP: visible only in the Reminders tab).</p>
              <div className="flex items-center gap-2 text-sm">
                <Bell className="h-4 w-4"/> Auto-generated — no setup needed
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={save}><CheckCircle2 className="mr-1 h-4 w-4"/>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ReminderPanel({ jobs, people }:{jobs:Job[], people:Person[]}){
  const today = new Date();
  const dueToday: {job:Job, task:Task}[] = [];
  jobs.forEach(j=> j.tasks.forEach(t=> { if (t.dueDate && isSameDay(parseISO(t.dueDate), today) && !t.done) dueToday.push({job:j, task:t}); }));
  return (
    <Card>
      <CardHeader>
        <CardTitle>Due Today</CardTitle>
        <CardDescription>Tasks assigned to team members that are due today</CardDescription>
      </CardHeader>
      <CardContent>
        {dueToday.length===0 ? (
          <p className="text-sm text-muted-foreground">Nothing due today 🎉</p>
        ) : (
          <div className="space-y-2">
            {dueToday.map(({job, task})=> (
              <div key={task.id} className="flex items-center justify-between rounded-xl border p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{task.title} <span className="text-xs text-muted-foreground">• {job.title}</span></p>
                  <div className="text-xs text-muted-foreground">{people.find(p=>p.id===task.assigneeId)?.name ?? 'Unassigned'}</div>
                </div>
                <Badge variant="secondary">{format(parseISO(task.dueDate!), 'MMM d')}</Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function NewJobDialog({ people, onCreate }:{people:Person[], onCreate:(j:Job)=>void}){
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [client, setClient] = useState("");
  const [desc, setDesc] = useState("");
  const [due, setDue] = useState("");
  const [priority, setPriority] = useState<Job['priority']>("Medium");
  const [assignees, setAssignees] = useState<string[]>([]);

  const submit = () => {
    if (!title || !client) return;
    const job: Job = {
      id: crypto.randomUUID(),
      title, client,
      description: desc,
      status: 'Backlog',
      priority,
      dueDate: due? new Date(due).toISOString(): undefined,
      ownerId: undefined,
      assigneeIds: assignees,
      tasks: [],
    };
    onCreate?.(job);
    setOpen(false);
    setTitle(""); setClient(""); setDesc(""); setDue(""); setPriority("Medium"); setAssignees([]);
  };

  return (
    <>
      <Button onClick={()=> setOpen(true)}><Plus className="mr-1 h-4 w-4"/>New Job</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create new job</DialogTitle>
            <DialogDescription>Add a job to the pipeline and assign teammates.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <div>
              <Label>Title</Label>
              <Input value={title} onChange={e=> setTitle((e.target as any).value)} placeholder="e.g., Ramadan social campaign" />
            </div>
            <div>
              <Label>Client</Label>
              <Input value={client} onChange={e=> setClient((e.target as any).value)} placeholder="Client name" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea rows={3} value={desc} onChange={e=> setDesc((e.target as any).value)} placeholder="Brief description" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Due date</Label>
                <Input type="date" value={due} onChange={e=> setDue((e.target as any).value)} />
              </div>
              <div>
                <Label>Priority</Label>
                <select className="h-9 w-full rounded-md border px-3" value={priority} onChange={e=> setPriority((e.target as any).value)}>
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                  <option>Urgent</option>
                </select>
              </div>
            </div>
            <div>
              <Label>Assignees</Label>
              <div className="max-h-28 overflow-auto rounded-md border p-2">
                {people.map(p=> (
                  <label key={p.id} className="flex items-center gap-2 py-1 text-sm">
                    <Checkbox checked={assignees.includes(p.id)} onCheckedChange={(v:boolean)=> setAssignees(a=> v? [...a, p.id] : a.filter(id=> id!==p.id))} />
                    {p.name}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={()=> setOpen(false)}>Cancel</Button>
            <Button onClick={submit}><CheckCircle2 className="mr-1 h-4 w-4"/>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
