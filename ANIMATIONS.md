# 3D episodes about GitHub for designers

Production brief and backlog for agents. The designer-facing version of this list is the "Наступні"
panel in the player (`docs/3d/backlog.js`, Ukrainian).

Every episode is a scene module in `docs/3d/episodes/<id>.js` plus its own track `<id>.mp3`, played by
the shared engine in `docs/3d/engine.js`. Shared style: GitHub Dark palette, the same two characters
Аня and Богдан, the same practice product Nimbus, all on-screen text in Ukrainian.

Before shipping an episode run `npm run test:e2e`: it walks every section, fails on plates, cards or
lines overlapping the caption or the chapter title, and saves frames to `test-results/frames/<episode>/`.
Look at those frames. Then remove the topic from the queue below and from `docs/3d/backlog.js`, add it to
the table of shipped episodes here and in `README.md`.

## Shipped

| # | Topic | Where |
| --- | --- | --- |
| 00 | **Merge conflict** — why it happens, what git writes into the file, three ways to resolve it | [`docs/3d/?ep=conflict`](docs/3d/index.html) · 1:46 |
| 01 | **Three states of a file** — working directory → staging → commit → GitHub, what can be lost | [`docs/3d/?ep=file-states`](docs/3d/index.html) · 1:32 |
| 02 | **Pull Request lifecycle** — Draft → Ready → line comment → answering commit → Approve → Squash and merge | [`docs/3d/?ep=pull-request`](docs/3d/index.html) · 1:41 |
| 03 | **Why main is protected** — the GH006 wall on a direct push, four rules as gates, the shield against force push | [`docs/3d/?ep=protected-main`](docs/3d/index.html) · 1:44 |
| 05 | **merge main vs rebase main** — merge adds a node and keeps your commits, rebase rewrites them; why rebase is off limits in a branch someone else has seen | [`docs/3d/?ep=merge-vs-rebase`](docs/3d/index.html) · 1:44 |

## Queue — pick a number and it gets built the same way

### History and undo

**04 · Squash vs merge commit vs rebase**
Three ways to merge the same branch, three different `main` histories side by side in 3D. Explains why
the team chose squash. Key frames: three parallel universes of history · how `main` reads afterwards.

**06 · Undo: revert, reset, reflog**
"We broke main", "committed to the wrong branch", "deleted a branch". Three different tools and one
rule: in shared history only `revert`. Key frames: revert as a new antidote commit · reflog as the black box.

### Shared code (closest to the design system)

**07 · Blast radius of a component change**
Changing a default in Button sends a wave through every screen that uses it. Next to it, the same task
solved with a new variant: the wave stays inside one screen. Direct continuation of the deck.
Key frames: screen dependency graph · wave vs local change.

**08 · CODEOWNERS: the file that assigns reviewers**
Repository paths light up when a PR touches them and pull in the right people. Explains why
`src/components` needs two approvals and a screen needs one. Key frames: a PR touching three folders ·
reviewers appearing automatically.

**09 · Tokens: one variable, the whole product**
Changing `--color-action` travels through components and screens. Next to it: what happens when a raw
value is written instead — the change never arrives. Key frames: token → component → screen tree ·
the broken chain.

### Team processes

**10 · A task from Issue to release**
Issue → branch → commits → PR → review → merge → version tag → what the client sees. Shows where the
designer sits in that chain. Key frames: one card travelling the whole path.

**11 · The green check: what checks and GitHub Actions are**
What GitHub Actions verifies while a PR is open and why a red build blocks the merge. Removes the magic
from "CI". Key frames: PR on hold · Actions running the build · red and green results.

**12 · Fork and an outside PR**
How a contractor or external designer works without write access: a copy of the repository, a PR back
into the main one, review. For working with client teams. Key frames: two repositories · the PR arrow.

### Everyday situations

**13 · Local vs GitHub**
Two copies of the repository: on your machine and on GitHub. What `fetch` does, what `pull` does, why
"I have it and you don't". Clears up the most common misunderstanding between two people.
Key frames: two commit columns · push arrow up · pull arrow down · the moment they diverge.

**14 · `.gitignore`: what never enters the repository**
`node_modules`, `.env`, Figma exports, `.DS_Store` — files that stay on your machine. What happens if
they get committed and how to fix it. Key frames: files flying into a commit, some bouncing off the
`.gitignore` mesh.

**15 · Stash: park unfinished work**
You must jump to another branch and the current work is not ready to commit. `git stash` as a shelf:
put it down, switch, come back, take it. Key frames: files vanish to the shelf · clean branch · return.

**16 · Conflict in `package-lock.json`**
The most common real conflict for designers working through an agent: both installed a package. Looks
terrifying at hundreds of lines, cured by one command — reinstall dependencies and commit.
Key frames: two `npm install` runs in different branches · a huge red diff · `rm package-lock.json && npm install`.

**17 · Undo a commit: local vs pushed**
While the commit is only yours — `reset`, and it never existed. Once it is on GitHub — only `revert`, a
new antidote commit. Two different worlds with different rules. Key frames: the commit disappears
locally · the same commit on GitHub already seen by a colleague.

**18 · "I'm in a weird state"**
Detached HEAD, an accidentally switched branch, files "in the wrong place". How to see where you are
(`git status`, `git log`) and get back without losses through `reflog`. Key frames: the camera gets lost
in the graph · reflog as a map of every step · the return.

### Review through a designer's eyes

**19 · A comment with a suggested edit**
The Add suggestion button in a PR: the reviewer proposes a concrete line, the author accepts it in one
click and it becomes a commit in the branch. Review without "fix this bit" in chat. Key frames: comment
→ suggestion block → Commit suggestion → new commit on the branch.

**20 · Image diffs**
GitHub compares PNGs in swipe, onion skin and side-by-side modes. For before/after screenshots this is a
designer's native tool. Key frames: two screenshots · the swipe curtain · translucent overlay.

**21 · A preview for every PR**
Vercel or Netlify builds a link for each branch. The client opens a screen by URL without cloning. The
one piece of infrastructure worth adding first. Key frames: PR opened → the build runs → link in a
comment → client opens it on a phone.

**22 · Who changed this line and when**
`git blame` and file history: find out why the button turned blue a month ago and in which PR it was
discussed. Key frames: a line of code highlights its commit → author → PR → discussion.

### History and safety

**23 · Time machine**
Open the repository as of any date and look at how a screen looked then. Compare it with today.
Key frames: a time slider over the graph · the screen changing along with it.

**24 · A secret in a commit**
An API key landed in the repository. Why deleting the file in the next commit does not help (history
remembers everything) and what to actually do: revoke the key, rewrite history only if the repo is
private. Key frames: file deleted but still in history · the key highlighted red in an old commit.

**25 · Force push**
One keystroke rewrites history a colleague has already seen: their commits are left dangling. Why it is
forbidden on `main` and when it is acceptable in your own branch. Key frames: two different `main`s in
two people's hands · the colleague's commits detaching from the graph.

**26 · Bisect: find the commit that broke it**
Binary search through history: 500 commits checked in 9 steps. Git switches the states, you only say
"works / doesn't". Key frames: half the graph goes dark at each step · the found commit lights up.

### Process and assets

**27 · Heavy files**
A 40 MB PNG stays in history forever, even after deletion. What Git LFS is and when it is needed.
Key frames: the repository fattening with each clone · LFS moving the file outside the graph.

**28 · Dependabot opens a PR**
Dependabot updates libraries by itself and opens a PR. How to read one, when to merge right away and
when to call a developer. Key frames: a PR with no human author · green check → merge.

**29 · Tags and releases**
A product version as a marker in history: `v1.2.0`, a changelog for the client, what the client actually
sees in a release. Key frames: tag flags on the main graph · a Release page with the list of changes.

**30 · Templates and labels**
PR template, issue template, labels `design`, `bug`, `needs-review`. The process that holds itself
together once the team grows to five people. Key frames: empty PR → filled template · a board with labels.

Strongest animation candidates from this block: 16, 20, 21, 23, 25. The rest work better as a deck slide
or an exercise in `PRACTICE.md`.

## How an episode is ordered

The designer names a number, in chat or by clicking a topic in the player's "Наступні" panel, which
copies a ready-made request. Deliverable: the 3D scene in the repository, its own music track, the
episode registered in the player, and a link from a deck slide when it fits.
