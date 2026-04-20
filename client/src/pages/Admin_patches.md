# Admin.tsx — 4 Targeted Patches
Apply these in GitHub by editing `client/src/pages/Admin.tsx` directly.
Each patch is a precise find-and-replace — no other lines change.

---

## PATCH 1 — Fix 2: After creating a course, navigate to editor and expand it in tree

**FIND** (one line, in `renderMain()`):
```
    if (section === 'courses_new') return <CourseForm course={null} t={t} onSaved={(c) => { setSection('courses_edit'); setEditingCourse(c); setCoursesOpen(true); loadCourseTree() }} />
```

**REPLACE WITH:**
```
    if (section === 'courses_new') return <CourseForm course={null} t={t} onSaved={(c) => {
      loadCourseTree()
      setSection('courses_edit')
      setEditingCourse(c)
      setCoursesOpen(true)
      setExpandedCourses(s => { const n = new Set(s); n.add(c.id); return n })
    }} />
```

---

## PATCH 2 — Fix 3: Empty state in CourseEditor shows Import Course hint

**FIND** (one line, inside `CourseEditor` component):
```
        <div style={{ border: `1px dashed ${t.border}`, borderRadius: '10px', padding: '32px', textAlign: 'center' as const, color: t.muted, fontSize: '0.875rem' }}>No modules yet. Add one above.</div>
```

**REPLACE WITH:**
```
        <div style={{ border: `1px dashed ${t.border}`, borderRadius: '10px', padding: '40px 32px', textAlign: 'center' as const }}>
          <p style={{ color: t.muted, fontSize: '0.875rem', marginBottom: '8px' }}>No modules yet.</p>
          <p style={{ color: t.dim, fontSize: '0.8rem', marginBottom: '20px' }}>Use <strong>Import Course</strong> in the sidebar to load all 8 modules and 47 lessons at once, or add modules manually above.</p>
        </div>
```

---

## PATCH 3 — Fix 4a: Add `key` to CourseEditor so it remounts when switching courses

**FIND** (inside `renderMain()`, the CourseEditor render block):
```
        <CourseEditor
          course={editingCourse}
          t={t}
          onBack={() => setEditingCourse(null)}
          onEditLesson={(l) => { setEditingLesson(l); setEditingModule(null) }}
          onTreeChange={() => loadCourseTree()}
        />
```

**REPLACE WITH:**
```
        <CourseEditor
          key={editingCourse.id}
          course={editingCourse}
          t={t}
          onBack={() => setEditingCourse(null)}
          onEditLesson={(l) => { setEditingLesson(l); setEditingModule(null) }}
          onTreeChange={() => loadCourseTree()}
        />
```

---

## PATCH 4 — Fix 4b: Add `key` to CourseForm inside CourseEditor

**FIND** (inside the `CourseEditor` function body, after the header section):
```
      <CourseForm course={course} t={t} />
```

**REPLACE WITH:**
```
      <CourseForm key={course.id} course={course} t={t} />
```

---

## Summary of what each fix does

| # | Issue | Fix |
|---|---|---|
| 1 | After creating a course the editor shows but the course isn't expanded in sidebar tree | `onSaved` now also calls `setExpandedCourses` to open the new course immediately |
| 2 | Empty modules state just says "Add one above" — no hint about Import Course | Empty state now points to Import Course in sidebar |
| 3 | Clicking a different course in sidebar doesn't reload the editor | `key={editingCourse.id}` forces React to fully remount `CourseEditor` when course changes |
| 4 | Course details form doesn't reset when switching courses | `key={course.id}` forces React to fully remount `CourseForm` when course changes |
