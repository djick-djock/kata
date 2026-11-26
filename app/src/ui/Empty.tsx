export function Empty({ title, children }: { title: string; children: string }) {
  return (
    <section className="empty">
      <h2>{title}</h2>
      <p>{children}</p>
    </section>
  )
}
