export default function ContactSection() {
  return (
    <section id="contact" className="mx-auto max-w-5xl px-6 pb-28 md:px-10 md:pb-36">
      <p className="text-xs uppercase tracking-[0.14em] text-black/55">Contact</p>
      <div className="mt-7 flex flex-col gap-4 text-base md:text-lg">
        <a href="mailto:studio@mette-tronvoll.com" className="w-fit underline underline-offset-4">
          studio@mette-tronvoll.com
        </a>
        <p className="text-black/70">Available for editorial commissions and gallery collaborations.</p>
      </div>
    </section>
  );
}
