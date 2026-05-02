import { ArrowRight, CalendarDays, MapPinned, Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const projects = [
  {
    title: "Remote Work Escape",
    summary: "A balanced two-week plan for travelers who want scenic mornings, cafe work sessions, and soft-adventure weekends.",
    destination: "Lisbon and Madeira",
    duration: "14 days",
    budget: "$1,800 - $2,300",
    highlights: ["Ocean-view work spots", "Flexible weekday schedule", "Weekend island hikes"],
  },
  {
    title: "Friends Trek Circuit",
    summary: "A high-energy group itinerary built around mountain routes, shared stays, and memorable evening hangouts.",
    destination: "Himachal Explorer Loop",
    duration: "9 days",
    budget: "$850 - $1,200",
    highlights: ["Road-trip friendly pacing", "Bonfire stayovers", "Adventure-first planning"],
  },
  {
    title: "Family Discovery Week",
    summary: "A comfort-focused project with low-stress transfers, kid-friendly activities, and built-in rest windows.",
    destination: "Singapore Highlights",
    duration: "7 days",
    budget: "$1,400 - $1,900",
    highlights: ["Easy city transport", "Balanced activity cadence", "Food and attraction picks included"],
  },
];

const TravelProjects = () => {
  const navigate = useNavigate();

  const handleUseProject = (project: (typeof projects)[number]) => {
    navigate("/create-trip", {
      state: {
        prefill: {
          name: `${project.title} - ${project.destination}`,
          description: `${project.summary} Highlights: ${project.highlights.join(", ")}.`,
        },
      },
    });
  };

  return (
    <section
      id="projects"
      className="relative overflow-hidden py-20 lg:py-28"
      style={{
        background: "linear-gradient(180deg, rgba(255,244,238,1) 0%, rgba(255,248,243,1) 100%)",
      }}
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-12 left-0 h-48 w-48 rounded-full bg-orange-200/40 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-56 w-56 rounded-full bg-amber-200/40 blur-3xl" />
      </div>

      <div className="container relative z-10 mx-auto px-4">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-gray-500">Voyagers Projects</p>
          <h2 className="mt-3 text-3xl font-display font-bold text-gray-900 md:text-5xl">
            Ready-made journeys you can launch in one click
          </h2>
          <p className="mt-4 text-sm leading-7 text-gray-700 md:text-base">
            These starter projects give visitors clearer examples of what Voyara can build, from workations to group adventures.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {projects.map((project) => (
            <article
              key={project.title}
              className="flex h-full flex-col rounded-[2rem] border border-orange-100 bg-white/90 p-6 shadow-[0_20px_45px_rgba(15,23,42,0.08)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_25px_60px_rgba(15,23,42,0.14)]"
            >
              <div className="mb-5 flex items-center justify-between gap-3">
                <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-orange-700">
                  Starter Project
                </span>
                <span className="text-sm font-medium text-gray-500">Voyara</span>
              </div>

              <h3 className="text-2xl font-display font-bold text-gray-900">{project.title}</h3>
              <p className="mt-3 flex-1 text-sm leading-7 text-gray-700">{project.summary}</p>

              <div className="mt-6 space-y-3 rounded-[1.5rem] bg-stone-50 p-4 text-sm text-gray-700">
                <div className="flex items-center gap-3">
                  <MapPinned className="h-4 w-4 text-orange-600" />
                  <span>{project.destination}</span>
                </div>
                <div className="flex items-center gap-3">
                  <CalendarDays className="h-4 w-4 text-orange-600" />
                  <span>{project.duration}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Wallet className="h-4 w-4 text-orange-600" />
                  <span>{project.budget}</span>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {project.highlights.map((highlight) => (
                  <span
                    key={highlight}
                    className="rounded-full bg-gray-900/5 px-3 py-1 text-xs font-medium text-gray-700"
                  >
                    {highlight}
                  </span>
                ))}
              </div>

              <Button
                className="mt-6 rounded-full bg-gray-900 px-5 py-6 text-white hover:bg-gray-800"
                onClick={() => handleUseProject(project)}
              >
                Use this project
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TravelProjects;
