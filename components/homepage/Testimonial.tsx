import Image from "next/image";

export function Testimonial() {
  return (
    <section className="mx-auto max-w-[1440px] px-6 py-20">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-lg font-medium text-text-primary">
          “I used to spend my evenings copy-pasting resumes. Now I open my dashboard to see
          interviews waiting. It feels like cheating. Had 3 offers on the table simultaneously.”
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Image
            src="/images/user-icon.png"
            alt="Tom Wilson"
            width={192}
            height={192}
            className="size-10 rounded-full"
          />
          <div className="text-left">
            <p className="text-sm font-medium text-text-primary">Tom Wilson</p>
            <p className="text-xs text-text-muted">Junior Developer</p>
          </div>
        </div>
      </div>
    </section>
  );
}
