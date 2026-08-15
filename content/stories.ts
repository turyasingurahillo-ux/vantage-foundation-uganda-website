import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Story } from "@/types";

const beyondTheWardBody = readFileSync(
  join(process.cwd(), "content", "stories", "beyond-the-ward.md"),
  "utf8"
);

export const stories: Story[] = [
  {
    id: "beyond-the-ward",
    slug: "beyond-the-ward",
    title: "Beyond the Ward",
    excerpt:
      "A practical, verified guide to research jobs, funded scholarships and careers beyond clinical practice for Uganda's medical graduates and health workers.",
    contentType: "Insight",
    author: "Vantage Foundation Uganda Research Team",
    authorType: "Organization",
    role: "Research and Learning",
    date: "2026-08-14",
    updatedAt: "2026-08-14",
    readingTimeMinutes: 39,
    location: "Uganda",
    category: "Career guide",
    heroImage: "/images/stories/beyond-the-ward-careers-uganda.webp",
    heroImageAlt:
      "A young Ugandan health professional carrying a white coat at branching paths toward research, public health, health data and clinical care.",
    heroImageCredit:
      "AI-generated editorial illustration — not a photograph of the people or events described.",
    consentClassification: "none",
    relatedProjectSlugs: [
      "rural-medical-camps",
      "mental-health-financial-literacy-workshops",
    ],
    tags: [
      "health workforce",
      "medical graduates",
      "career guidance",
      "research jobs",
      "scholarships",
      "Uganda",
    ],
    seo: {
      title: "Careers for Medical Graduates in Uganda",
      description:
        "Explore verified careers for medical graduates in Uganda: research jobs, funded scholarships, M&E, digital health, free skills and practical next steps.",
      // No ogImage: the hero is WebP, which link-preview crawlers do not
      // render. The generated 1200x630 JPEG card is used instead — see
      // lib/social-image.ts.
    },
    faqs: [
      {
        question:
          "What careers are available for medical graduates in Uganda besides clinical practice?",
        answer:
          "You can build a career in research, epidemiology, public health, M&E, health informatics, digital health, pharmacovigilance, regulatory affairs, medical writing, programme management, policy or health-tech product work. The degree gives you clinical context; employers will still want evidence of a practical skill, project, placement or relevant entry-level role.",
      },
      {
        question: "Can a doctor work in research without a master's degree?",
        answer:
          "Yes. Entry roles can include Research Assistant, Study Clinician, Research Clinician, Data Officer, Field Officer or Study Coordinator. A master's may help with progression, but it is not a universal entry requirement. GCP, data skills, strong documentation and visible research interest can matter first.",
      },
      {
        question: "Can an MBChB graduate work in monitoring and evaluation?",
        answer:
          "Yes. A medical degree can satisfy the health-background requirement for many M&E roles, but it does not replace practical experience. Build through Excel, KoboToolbox, DHIS2, data-quality checks, indicators and reporting, then target Data Assistant, Programme Assistant or M&E Assistant roles before M&E Officer positions.",
      },
      {
        question: "Which funded scholarships suit a fresh Ugandan graduate?",
        answer:
          "Commonwealth Shared, Erasmus Mundus Joint Masters, Türkiye Scholarships and UGHE's Mastercard Foundation Scholars Program do not currently state a minimum work-experience requirement. Each has other eligibility rules, and none had a confirmed open call on 14 August 2026. Prepare documents now and wait for the official next call.",
      },
      {
        question: "Can a 2025 or 2026 graduate apply for Chevening in 2026?",
        answer:
          "No. For the 2027/28 round, Chevening requires 2,800 hours of work after the undergraduate degree and excludes applicants who completed that degree after October 2024. A recent graduate should document paid and voluntary work and build toward a later round instead of spending time on an ineligible application.",
      },
      {
        question: "Which two free certificates should I start first?",
        answer:
          "Start ICH Good Clinical Practice E6(R3) through The Global Health Network and an introductory DHIS2 course through the DHIS2 Online Academy. Then build evidence: clean a permitted dataset, create a KoboToolbox form or produce a small dashboard. A certificate becomes useful when you can demonstrate the skill.",
      },
      {
        question: "Where should I look for medical research jobs in Uganda?",
        answer:
          "Monitor the official portals of MRC/UVRI & LSHTM, IDI, MU-JHU, RHSP, IDRC Uganda, UVRI, TASO, Baylor Uganda and Amref. Roles close quickly, so check weekly and search by job title, not only ‘doctor’: Research Assistant, Study Clinician, Data Officer, Field Officer and Study Coordinator.",
      },
      {
        question: "Are research internships and volunteer placements paid?",
        answer:
          "Some are paid, some unpaid and some may involve costs. Never infer financial terms from the word ‘internship.’ Before accepting, ask in writing about allowance, transport, meals, accommodation, insurance, fees, working hours, supervision and the certificate or reference you will receive. Vantage's position is that productive work should be fairly compensated.",
      },
      {
        question: "Does low European tuition mean a degree is affordable?",
        answer:
          "Not necessarily. For Austria in 2026, a student aged 24 or older generally needed base maintenance proof of €15,700.68 for 12 months, in addition to insurance, extra rent where applicable, tuition, travel and the €218 permit fee. Calculate the entire funding gap before applying.",
      },
      {
        question: "What if I have no formal work experience?",
        answer:
          "Begin with a standing internship or volunteer route, community-health work, a data or programme assistant role, or a supervised project. Keep a log of dates, hours, responsibilities and supervisors. Chevening counts eligible post-degree voluntary and internship work; other programmes use different definitions, so always follow the scheme's own rules.",
      },
      {
        question: "Is a delayed internship year a wasted year?",
        answer:
          "No—but it needs structure. Use the year to gain one practical data skill, complete GCP, build a small portfolio, enter a health or research organisation, document service and prepare scholarship materials. These steps do not resolve the injustice of delayed or unpaid internship; they protect your momentum while the system changes.",
      },
      {
        question:
          "Does this guide apply to nurses, pharmacists and other health workers?",
        answer:
          "Much of it does. Scholarships, research placements, M&E, digital health and public-health routes often accept several health disciplines. Pharmacists have a strong fit with pharmacovigilance; laboratory scientists may fit UNIPH's Laboratory Leadership track. Never infer eligibility from ‘health-related degree’—check the accepted qualifications in the current call.",
      },
    ],
    body: beyondTheWardBody,
    published: true,
  },
  {
    id: "why-youth-spaces-matter-in-uganda",
    slug: "why-youth-spaces-matter-in-uganda",
    title: "Why Youth Spaces Matter in Uganda",
    excerpt:
      "Creating safe, inclusive environments where young people can learn, connect, lead and turn potential into opportunity.",
    author: "Vantage Foundation team",
    role: "Research & Learning",
    date: "2026-08-04",
    location: "Uganda",
    category: "Research & Learning",
    heroImage: "/images/photos/photo-073.webp",
    heroImageAlt:
      "A large classroom of secondary school students in uniforms and headscarves sits at wooden desks during a mentorship session in Kampala.",
    consentClassification: "verified",
    tags: ["youth empowerment", "youth leadership", "Uganda", "education"],
    seo: {
      title: "Why Youth Spaces Matter in Uganda | Vantage Foundation Uganda",
      description:
        "Uganda has one of the world’s youngest populations. Discover why safe, inclusive youth spaces support leadership, employment, wellbeing and innovation.",
      // No ogImage: see the note on Beyond the Ward above.
    },
    body: `Uganda is a young country—and that may be one of the most important facts about its future.

The **2024 National Population and Housing Census recorded Uganda’s population at 45,905,417**. Almost half of the population—**22.75 million people—are below the age of 18**. The census also counted approximately **10.77 million young people aged 18 to 30**, representing about **23.5% of the population**.

These are more than demographic statistics. They point to a fundamental opportunity: if young people thrive, Uganda has an extraordinary chance to thrive with them.

But potential does not automatically become opportunity.

Young people need environments where they can learn, connect with mentors, access services, develop ideas, build confidence and practise leadership. They need places where they are not simply discussed, but listened to. They need to be treated not only as beneficiaries, but also as participants, creators and leaders.

This is why **youth spaces in Uganda matter**.

## Uganda’s youth opportunity is enormous

Uganda’s young population creates the possibility of a demographic dividend—the economic and social benefits that can emerge when a large young population is healthy, educated, skilled and productively engaged.

That dividend is not automatic. It requires deliberate investment in education and skills, employment and entrepreneurship, health and wellbeing, women and girls, innovation and technology, financial inclusion, and youth participation.

Youth spaces can contribute by bringing several forms of support together around the young person. A well-designed space can connect learning, mentorship, health information, digital access, entrepreneurship and community participation in one trusted environment.

## Why action is urgent

Uganda’s young people are entering adulthood in an economy that cannot easily absorb everyone seeking meaningful work.

According to [Uganda Bureau of Statistics data](https://www.ubos.org/uganda-profile/), **50.9% of people aged 18 to 30 were not in employment, education or training**, representing approximately **5.25 million people**. Among people aged 15 to 24, the proportion was **42.6%**.

Youth unemployment among people aged 15 to 24 was **17.9%**. Unemployment was higher among young women, at **21.0%**, compared with **15.2% among young men**.

The [World Bank estimates](https://www.worldbank.org/en/news/press-release/2026/06/04/world-bank-group-launches-ten-year-strategy-to-drive-jobs-and-prosperity-in-uganda) that **600,000 to 700,000 young people enter Uganda’s labour market each year**.

These figures make one thing clear: young people need more than encouragement. They need infrastructure for opportunity.

## What is a youth space?

A youth space is more than a building. It is a **safe, inclusive and empowering environment where young people can meet, learn, create, receive support and exercise leadership**.

A strong youth space might provide:

- Leadership and life-skills development
- Career guidance and mentorship
- Entrepreneurship support and financial literacy
- Digital-skills training and access to computers
- Health information, referrals and psychosocial support
- Peer networks, creative activities and volunteer opportunities
- Support for youth-led initiatives

A room becomes a youth space when young people feel that they belong there, that their ideas matter and that they have opportunities to grow.

## From unemployment to opportunity

The employment challenge facing Uganda cannot be solved through job advertisements alone. Practical youth spaces can help young people write CVs, prepare for interviews, build digital skills, develop business ideas, understand saving and create professional networks.

This transforms the space from a community centre into an **opportunity hub**.

Financial knowledge is also an important part of youth development. Through financial-literacy initiatives connected to [KikumiKyo Academy](/programmes/education), young people can develop practical knowledge about saving, financial planning, responsible borrowing, investment and entrepreneurship.

## Leadership requires somewhere to practise

Young people are often told that they are tomorrow’s leaders. But leadership cannot begin tomorrow. It must be practised today.

Youth spaces give young people opportunities to organise activities, manage projects, chair discussions, identify community problems and develop solutions.

The question is not only, “How many young people attended?” We should also ask: how many led, made decisions, developed projects or became mentors?

That is the difference between basic participation and meaningful **youth empowerment in Uganda**.

![A facilitator leads a classroom activity with young people during a Vantage Foundation session in Uganda.](/images/photos/photo-016.webp)

## Young women need more than inclusion on paper

Young women do not always experience the same opportunities as young men. Creating a youth space does not automatically make it inclusive. Inclusion must be designed.

A space that genuinely works for young women should consider physical and emotional safety, harassment prevention, female mentors, leadership opportunities, confidentiality, accessible programme schedules, sexual and reproductive health information, economic empowerment and gender-sensitive safeguarding.

Most importantly, young women must not simply be present. They must have **voice, influence and leadership**.

![Students and teachers gather for a Women’s Day celebration at Basajjabalaba High School in Bushenyi.](/images/photos/photo-038.webp)

## Health and opportunity are connected

[UNICEF Uganda identifies](https://www.unicef.org/uganda/what-we-do/adolescent-development) poverty, HIV, early marriage, teenage pregnancy, gender-based violence and limited participation in secondary education among the challenges facing adolescents.

Youth spaces can become trusted entry points for health education and referrals, connecting young people to sexual and reproductive health services, mental-health support, HIV information, counselling and gender-based violence services.

At **Vantage Foundation Uganda**, this approach complements the work of [Vantage Care](/programmes/health), which focuses on improving access to health services and information through community-centred medical outreach.

## Digital access is part of opportunity

Applications, training, business marketing, professional networking and financial services are increasingly digital. A youth space equipped with computers, internet connectivity and digital mentorship can therefore provide access to the modern economy.

Young people can use these spaces to learn digital productivity skills, explore online education, create professional profiles, apply for jobs and training, research business opportunities and build confidence using technology.

## Youth spaces can turn ideas into initiatives

Uganda does not lack young people with ideas. What is often missing is the ecosystem around those ideas: mentorship, workspace, technology, project-management skills, networks, partnerships and funding.

Youth spaces can provide the bridge between **“I have an idea”** and **“We are doing something about it.”**

Youth-led solutions should be seen as a resource for communities—not merely as exercises for young people.

## What should a successful youth space achieve?

Attendance matters, but it is only a starting point. Organisations should also ask whether young people are safer, whether young women are leading, whether vulnerable young people can participate, whether participants are gaining useful skills and whether youth-led projects are emerging.

Most importantly: **Are young people leaving with more agency than when they arrived?**

![Young people take part in a financial literacy and career education conference in Bushenyi.](/images/projects/bushenyi-youth-conference-27.webp)

## The Vantage Foundation Uganda perspective

At **Vantage Foundation Uganda**, our mission is to **change the world one advantage at a time**.

Access to a computer, a meeting with a mentor, health information, financial knowledge or a safe place to develop an idea can create lasting change. These advantages can multiply across families and communities.

That is why investing in youth spaces is ultimately an investment in communities.

## Uganda’s future needs spaces where young people can thrive

Uganda has approximately **10.77 million people aged 18 to 30**. More than **5.25 million young people aged 18 to 30** are estimated to be outside employment, education or training, while **600,000 to 700,000 young people enter the labour market each year**.

Uganda does not lack young people with potential. What remains insufficient are the environments, resources, networks and opportunities that allow that potential to grow.

Youth spaces are not simply rooms. They are infrastructure for **belonging, opportunity, wellbeing, leadership and innovation**.

At Vantage Foundation Uganda, we believe that when young people are given the right advantages, they can do more than change their own lives.

**They can change their communities—and, one advantage at a time, change the world.**

## Sources

- [UBOS National Population and Housing Census 2024](https://statistics.ubos.org/nphc/)
- [UBOS Uganda profile and labour-market indicators](https://www.ubos.org/uganda-profile/)
- [UNFPA Uganda: Census 2024 and Uganda’s youthful population](https://uganda.unfpa.org/en/news/census-2024-preliminary-results-released-uganda-remains-young-population)
- [UNICEF Uganda: Adolescent development](https://www.unicef.org/uganda/what-we-do/adolescent-development)
- [World Bank: Uganda Country Partnership Framework 2026–2035](https://www.worldbank.org/en/news/press-release/2026/06/04/world-bank-group-launches-ten-year-strategy-to-drive-jobs-and-prosperity-in-uganda)`,
  },
  {
    id: "healers-in-crisis-ugandas-medical-interns",
    slug: "healers-in-crisis-ugandas-medical-interns",
    title: "Healers in Crisis: Why Uganda Cannot Afford to Lose Its Young Doctors",
    excerpt:
      "From 3 August, 2,417 medical interns take up posts in Uganda's hospitals with no answer on whether they will be paid. Their allowance has not so much been cut as defined out of existence. Dr Turyasingura Hillary A. on a crisis the nation cannot keep deferring.",
    author: "Dr. Turyasingura Hillary A.",
    role: "Co-founder and Operations Director",
    date: "2026-08-02",
    location: "Kampala, Uganda",
    category: "Health policy",
    heroImage: "/images/stories/healers-in-crisis-hero.webp",
    heroImageAlt:
      "Four young Ugandan doctors and nurses in scrubs and white coats standing outside a public hospital entrance, an ambulance and waiting patients behind them.",
    // These illustrations are AI-generated, not Vantage field photography.
    // The brand photography guide calls for documentary, non-staged imagery,
    // so provenance is disclosed in visible copy rather than left implicit.
    heroImageCredit:
      "AI-generated illustration — not a photograph of the interns described here.",
    // No real individuals are depicted, so no consent is owed or on file.
    // Consider adding an explicit "illustration" classification to
    // ConsentClassification if synthetic imagery becomes a regular pattern.
    consentClassification: "none",
    relatedProjectSlugs: [
      "rural-medical-camps",
      "mental-health-financial-literacy-workshops",
    ],
    tags: [
      "health workforce",
      "medical interns",
      "health policy",
      "Uganda",
      "brain drain",
    ],
    seo: {
      title: "Uganda's medical interns crisis",
      description:
        "From 3 August, 2,417 Ugandan medical interns start work with no answer on pay. Inside the NETH policy that defined their allowance out of existence.",
      // Hand-made card, kept in preference to a generated crop of the hero.
      socialImage: {
        url: "/images/og/healers-in-crisis-ugandas-medical-interns.png",
        width: 1200,
        height: 630,
        type: "image/png",
      },
    },
    body: `*Healers in Crisis — a Vantage Foundation Uganda perspective on the human cost of an ailing health workforce.*

**KAMPALA, 2 August 2026** — In wards across Uganda, the person most likely to be at a patient's bedside at three in the morning is not a senior consultant. It is a young intern, often less than a year out of medical school, running on a few hours of sleep, managing a caseload that would strain a far more experienced team — and, as of this month, doing it without any certainty of being paid.

This is the reality behind the headlines. Uganda's doctors, and especially its medical interns, are the backbone of a health system that serves more than 46 million people. Yet the people holding that system together are themselves in crisis: underpaid, overworked, under-supervised, and increasingly uncertain whether their profession has a future at home.

At Vantage Foundation Uganda, our health work — from [rural medical camps](/projects/rural-medical-camps) to [mental-health workshops in schools](/projects/mental-health-financial-literacy-workshops) — is built on a simple conviction: a health system is only as strong as the people who carry it. Right now, Uganda is asking its young doctors to carry too much, for too little, for too long. This is what that looks like up close.

## A workforce stretched far beyond its limits

Uganda's doctor-to-patient ratio stands at roughly one physician for every 25,000 people, against a World Health Organization benchmark of one doctor per 1,000. Barely a thousand new doctors graduate each year in a country whose population is projected to grow from 46 million to 85 million by 2050. Dr Jane Ruth Aceng, then Health Minister, warned of a critical shortage of specialists — surgeons, anaesthesiologists, oncologists, nephrologists, and critical-care experts — just as demand for advanced treatment such as cancer care, kidney transplants, and bone-marrow transplants is rising. That warning now sits at a different desk: in the cabinet reshuffle announced at the end of May 2026, President Museveni swapped Dr Aceng into the ICT and National Guidance portfolio and moved Dr Chris Baryomunsi — a medical doctor by training — into Health.

Into this gap step the interns. Junior and senior house officers make up more than 75 percent of the medical workforce in Uganda's regional referral hospitals and deliver over 90 percent of emergency obstetric care nationwide. In many public facilities, interns account for 70 to 80 percent of the doctors a patient will actually encounter. They are, in every meaningful sense, running the front line of Ugandan healthcare — often with senior consultants absent and oversight thin, a gap that compromises both patient safety and the quality of the training interns are meant to be receiving.

We see the consequences of this gap in our own work. When our rural medical camps refer patients onward to public facilities, it is most often an intern who receives them. The strength of the front line determines whether a referral saves a life or simply moves a patient from one queue to another.

## Paid to disappear: the allowance crisis

For years, the government's compact with medical interns was simple: in exchange for a punishing year of clinical service, interns would receive a monthly allowance. The figure most often cited — 2.5 million shillings — was never a routine administrative rate. It was a presidential directive.

In May 2021, interns went on strike, asking that their allowance rise from 750,000 shillings towards the five million paid to a fully appointed medical officer. The strike was called off in June after negotiations involving President Museveni himself, and in a letter to the Prime Minister and the relevant ministries he directed that interns be paid 2.5 million shillings a month — half the recommended pay of a fully appointed officer — with effect from July 2021. The same adjustment was to cover graduate nurses, midwives and pharmacists.

The directive was never reliably honoured. Interns went back to the wards and the payments did not follow; by November they were on strike again. Disbursements have since run four to six months behind schedule, the 2023 national budget excluded intern payments altogether, and the figure itself was quietly cut to a million shillings. By August 2024 the President was telling a group of interns at State House that the money was simply not there: *"Who pays for the internship? Some people are saying that the government must pay, but I think that is risky because the government would pay if it had money."*

That history matters, because it shapes how the present reform is received. Interns are not being asked to absorb a hard budget decision for the first time. They are being asked to accept the formal withdrawal of something a president personally promised them in order to end a strike, and then did not deliver for five years.

In 2026, the compact broke down entirely. The instrument behind the change is the National Education and Training for Health (NETH) Policy, together with its National Internship Management Framework — approved by Cabinet in October 2024, set out publicly in April 2026 and effective from August. It does not simply withdraw a payment. It redefines what an internship is: clinical training is folded into the university degree, medical courses stretch from five years to six, and the internship year now falls before graduation rather than after it. On that reading, interns are no longer junior professionals earning an allowance. They are undergraduates completing a course requirement.

The Ministry of Health defends the reform as closing an accountability gap. Through its Commissioner for Clinical Services, Dr Ronnie Bahatungire, it has argued that universities were graduating students before those students had finished their practical training in hospitals. The savings, the ministry says, will be redirected into specialist training and stronger supervision at internship centres — the very gaps Dr Aceng had warned about. Under the new arrangement, only government-sponsored students are promised anything in place of cash: meals, accommodation and transport, and then only where a hospital cannot provide them.

The profession rejects the premise. Dr Frank Asiimwe, President of the Uganda Medical Association, has questioned the legality of requiring an additional year of unpaid clinical work before a degree is awarded. It is worth being precise about who owns this decision: Cabinet took it more than a year before the May 2026 reshuffle, while Dr Aceng still held the health portfolio. Dr Baryomunsi did not author the policy — but as of this month it is his to defend or to reverse. In mid-June, days after the 2026/27 budget was read, he said the government must continue to sponsor medical interns and that he would engage the President to find the money; Vice President Jessica Alupo told Parliament that laws are not cast in stone and that Cabinet would revisit the policy. Whether that becomes an actual reversal or simply a holding statement is the question this week answers.

In the interim, more than 180 interns went four months without pay — and on the reduced allowance of a million shillings, about $270, when it came at all — even as they continued working shifts of 36 to 48 hours without rest. The Federation of Uganda Medical Interns — the body representing every intern in service, over 2,300 of them across 74 health facilities — has warned that withholding pay breaches both employment contracts and the Public Service Standing Orders, and has escalated the matter to the Attorney General with the threat of litigation.

The National Senior House Officers Secretariat put the underlying grievance bluntly: *"Medical interns are not free labour. They are qualified health professionals under supervision, providing essential patient care. Uganda cannot build a functional health system on unpaid doctors."* The Uganda Medical Association raised a further concern of fairness: a government proposal to continue supporting only government-sponsored interns while limiting privately-sponsored graduates to a lunch allowance, despite both groups shouldering identical costs — equipment worth roughly a million shillings before deployment, transport, accommodation, and the same 36-hour shifts.

The collision is no longer hypothetical. On 22 July the Federation of Uganda Medical Interns issued a ten-day ultimatum: suspend the NETH policy, implement the President's 2021 directive, pay allowances promptly each month, and deploy every eligible intern. The deadline expired as August began. On 30 July the Uganda Medical Internship Committee published the placement list regardless: 2,417 newly qualified graduates assigned to hospitals across the country for a year running from 3 August 2026 to 31 July 2027, drawn from Makerere, Busitema, Mbarara, Soroti, Lira, Gulu and Kampala International universities. They are the first cohort who will serve the entire year under the new policy. The list settles precisely where each of them will work. It says nothing about whether any of them will be paid.

They had already said they would not report unless government guaranteed equal facilitation for every intern, regardless of whether their studies were state- or privately-sponsored. Those named on the list have boycotted their induction. It is a hard position to take — refusing to begin the year that stands between them and a licence to practise — and it measures how little confidence remains that the question of payment will be answered once they are already on the wards.

The moral weight of the issue has reached well beyond the medical profession. Archbishop Stephen Samuel Kaziimba Mugalu posed the question that has come to define public frustration with the policy: how can government find 158 billion shillings to purchase vehicles for members of parliament, he asked, but not the 28 billion shillings needed annually to pay medical interns who keep the country's hospitals running?

## The human cost, on both sides of the stethoscope

It is tempting to treat this as a reclassification — a change of category on paper, tidying up where clinical training sits in a curriculum. It is not. When interns go unpaid, hospitals do not stop needing them — the work does not disappear, only the compensation does. Exhausted, financially strained young doctors are being asked to make split-second clinical decisions in under-resourced wards, often the sole doctor available to a ward full of patients. Fatigue of this kind is not an abstract risk; it is directly linked to medical error, missed diagnoses, and burnout that follows doctors for the rest of their careers.

The patients who bear the consequences are disproportionately Uganda's poorest. Ugandans with means already travel abroad or to private facilities for serious care; it is patients in public referral hospitals — mothers in obstetric wards, children with malaria, accident victims arriving in the night — who depend entirely on the intern standing over them. When that intern is exhausted, unpaid, and one of only a handful of doctors on a ward built for a fraction of its actual patient load, the crisis in medical training becomes, very quickly, a crisis in patient care.

There is also a slower, quieter cost: the export of talent. Uganda has long produced doctors who go on to distinguish themselves abroad, in the UK's NHS and elsewhere, precisely because their training is demanding. But every additional reason to leave — unpaid internships, unreliable career pathways, chronic understaffing, absent specialists to mentor them — adds momentum to a brain drain that a country of 46 million people, with one of the youngest populations in the world, can scarcely afford. Every doctor who boards a plane and does not come back is a doctor Uganda trained at public expense for another country's hospitals.

## What needs to change

The interns and their associations have not asked for the impossible. What follows is what they have asked for, and what we believe the country owes them:

- **Interns be paid.** Not as a concession to be negotiated down, and not as a line that yields whenever the budget tightens. A qualified doctor holding a ward through the night is doing work the country depends on, and work a country depends on is work it pays for. Every ask below assumes this one.
- **The trade-off be refused.** The ministry says the money freed by scrapping allowances will fund specialist training and stronger supervision. Supervision does need funding — this article has argued exactly that. But paying for it by defunding the people being supervised is not a reform; it moves the cost onto the least powerful person on the ward and calls the transfer an improvement. Both are obligations of the same employer. Neither is payment for the other.
- **Contracts be honoured.** Whatever the new policy determines about the future, the arrears accrued under the old compact remain a debt already incurred. The government should comply with the Public Service Standing Orders and clear what interns have earned — in full, as a floor rather than a negotiable extra.
- **Interns be treated equally.** Government-sponsored and privately-sponsored interns do identical work and should receive identical support.
- **Conditions be fixed alongside pay, not instead of it.** Welfare, working hours, working conditions and genuine mentorship. A 36- to 48-hour shift without rest is a patient-safety hazard before it is a labour grievance, and an intern left alone on a ward is not being trained — they are being used to fill a gap the system has not staffed.
- **Reform be consultative.** Any restructuring of medical training should be developed with the Uganda Medical Association, the Federation of Uganda Medical Interns, and training institutions — not announced unilaterally.

None of these asks is extravagant. Each of them is the minimum a country owes the people it asks to keep its citizens alive.

## A moment that calls for more than sympathy

Vantage Foundation Uganda believes this is a moment that calls for more than sympathy. It calls for public attention, for policymakers to be held to their existing commitments, and for solidarity with the young doctors who — allowance or no allowance — are still the ones standing at the bedside at three in the morning.

Our own health programmes are modest compared with the scale of this crisis, but they rest on the same principle: a country's health system is only as strong as the people who carry it. When we run a rural medical camp, we depend on clinicians who were trained in those same understaffed wards. When we host mental-health workshops for young people, we are working alongside the very generation of professionals this policy is pushing towards the exit. The fight to keep Uganda's healers at home is everyone's fight.

A country that can find 158 billion shillings for parliamentary vehicles can find 28 billion to pay the doctors who keep its hospitals running. The question is no longer whether the money exists. It is whether the country has the will to spend it on the people who need it most.

That is a debt the nation cannot keep deferring.

---

**Sources**

- [Uganda: Doctors Warn Scrapping Medical Interns' Allowances Could Cripple Uganda's Health System – allAfrica](https://allafrica.com/stories/202606050021.html)
- [Doctors reject government deal as internship crisis cripple service delivery – Monitor](https://www.monitor.co.ug/uganda/news/national/doctors-reject-government-deal-as-internship-crisis-cripple-service-delivery-5493088)
- [Uganda: Medical Interns Take On Govt Over Four-Month Delayed Allowances – allAfrica](https://allafrica.com/stories/202511190440.html)
- [Medical Training in Uganda: A Critical but Neglected Part of the Healthcare System – PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC10324625/)
- [Uganda Faces Critical Shortage of Specialist Doctors as Demand for Advanced Care Rises – Nile Post](https://nilepost.co.ug/news/340699/uganda-faces-critical-shortage-of-specialist-doctors-as-demand-for-advanced-care-rises-aceng)
- [Museveni Swaps Aceng, Baryomunsi in Major Cabinet Reshuffle – Nile Post](https://nilepost.co.ug/news/344521/museveni-swaps-aceng-baryomunsi-in-major-cabinet-reshuffle)
- [Health Ministry insists on scrapping intern doctors' allowance despite public outcry – The Independent](https://www.independent.co.ug/health-ministry-insists-on-scrapping-intern-doctors-allowance-despite-public-outcry/)
- [Gov't scraps allowances for medical interns as training becomes part of university degree – Matooke Republic](https://www.matookerepublic.com/news/20260601/govt-scraps-allowances-for-medical-interns-as-training-becomes-part-of-university-degree/)
- [UMA rejects proposal to offer lunch instead of intern allowances – The Independent](https://www.independent.co.ug/uma-rejects-proposal-to-offer-lunch-instead-of-intern-allowances/)
- [Museveni directs medical interns to be paid UGX 2.5M – The Independent](https://www.independent.co.ug/museveni-directs-medical-interns-to-be-paid-ugx-2-5m/)
- [U-turn on Museveni order as Shs2.5m intern allowance dropped – Monitor](https://www.monitor.co.ug/uganda/news/national/u-turn-on-museveni-order-as-shs2-5m-intern-allowance-dropped-5302292)
- [No money to pay medical interns, says Museveni – Medicopress](https://medicopress.media/no-money-to-pay-medical-interns-says-museveni/)
- [VP, Health Minister to 'reverse' Museveni's decision on paying medical interns – Black Star News](https://blackstarnews.com/uganda-vp-health-minister-to-reverse-musevenis-decision-on-paying-medical-interns/)
- [Medical Interns Give Government 10-Day Ultimatum to Suspend NETH Policy – Radio Sapientia](https://www.radiosapientia.com/2026/07/22/medical-interns-give-government-10-day-ultimatum-to-suspend-neth-policy/)
- [FULL LIST: Uganda Medical Interns deployed after prolonged delay – ChimpReports](https://chimpreports.com/full-list-uganda-medical-interns-deployed-after-prolonged-delay/)
- [Uganda: Govt Confirms Medical Internship Placements for 2025-2026 in National Hospitals – allAfrica](https://allafrica.com/stories/202507310001.html)
- [Medical interns insist on their remuneration and welfare pay – Radio Sapientia](https://www.radiosapientia.com/2026/07/31/medical-interns-insist-on-their-remuneration-welfare-pay/)
- [Medical pre-interns demand clarity on welfare ahead of August deployment – Campus Bee](https://campusbee.ug/news/medical-pre-interns-demand-clarity-on-welfare-ahead-of-august-deployment/)
- [Quality, not quantity of doctors, must be Uganda's priority – Monitor](https://www.monitor.co.ug/uganda/oped/columnists/muniini-k-mulera/quality-not-quantity-of-doctors-must-be-uganda-s-priority-4755842)
- ["You cannot find Shs28 billion for medical interns but you have Shs158 billion for MPs' cars," Archbishop Kaziimba tells Government – Matooke Republic](https://www.matookerepublic.com/news/20260608/you-cannot-find-shs28-billion-for-medical-interns-but-you-have-shs158-billion-for-mps-cars-archbishop-kaziimba-tells-government-to-reconsider-suspension-of-medical-interns/)
- [Uganda Ends Paid Medical Internships Amid Budget Constraints and Growing Protests – The Brief Post](https://thebriefpost.com/uganda-ends-paid-medical-internships-amid-budget-constraints-and-growing-protests/)`,
  },
  {
    id: "what-are-we-without-our-dreams",
    slug: "what-are-we-without-our-dreams",
    title: "What are we without our dreams?",
    excerpt:
      "A reflection from one of the young people who has journeyed with Vantage Foundation on what it means to hold onto hope.",
    author: "Dr Nassazi Kauthar Wangi",
    role: "Youth participant",
    date: "2023-06-01",
    location: "Uganda",
    category: "Youth voice",
    heroImage: "/images/photos/photo-058.webp",
    heroImageAlt:
      "A young woman in a \"Vantage Foundation, Write My Own Story\" t-shirt sits and smiles outdoors near a borehole pump.",
    consentClassification: "verified",
    relatedProjectSlugs: ["savegirl-uganda", "advantage-book-club"],
    body: `We come into this world and we are given many things. A name. A nationality. A tribe. A religion. A language. A family. A place to call home.

Most of these things are chosen for us before we are old enough to understand what they mean. They become part of our identity, and society often uses them to explain who we are.

But somewhere beneath all these labels, there is something much more personal.

Our dreams.

There is something strange and beautiful about dreaming. We do not always choose what moves us. We simply discover it.

One person sees a sick patient and feels a deep desire to heal. Another looks at numbers and sees possibilities. Someone else finds meaning in teaching children, building houses, growing food, painting, singing, designing, writing or starting a business.

Why does one thing make one person's heart come alive while another person feels nothing for it?

Perhaps we will never fully know.

Human beings need meaning, purpose and hope. We need something that makes tomorrow worth reaching for. A dream can become that thing.

And dreams seem to care very little about where we come from.

A child in a wealthy home can dream. So can a child in a village without electricity.

A young person in a refugee settlement can dream. So can someone growing up in the middle of a large city.

Dreams do not first ask about our income, gender, race, religion or social class before appearing inside us.

This is what makes them powerful.

Perhaps dreams are among the few things that truly feel like our own.

And yet, there is an uncomfortable truth: while everyone can dream, not everyone has the same opportunity to pursue their dreams.

Talent can exist without opportunity. Intelligence can exist without education. Ambition can exist without money.

A brilliant young person can be born anywhere. But where they are born can determine whether the world ever gets to see that brilliance.

That raises an important question for all of us:

**How many dreams have we lost, not because people were incapable, but because they were never given a chance?**

Perhaps development is not only about giving people things. Perhaps it is also about removing the barriers between people and who they could become.

Give a child education. Give a young woman a safe space. Give a family access to healthcare. Give a young person knowledge, mentorship and opportunity.

Sometimes, what you are really giving them is permission to imagine a different future.

Our names tell people what to call us. Our nationalities tell them where we come from. Our communities tell part of our story.

But our dreams whisper something different.

They tell us where we hope to go.

And perhaps, somewhere between who we are and who we dream of becoming, we find the deepest part of ourselves.`,
  },
  {
    id: "the-meaning-of-advantage",
    slug: "the-meaning-of-advantage",
    title: "The meaning of advantage",
    excerpt:
      "Hillary Turyasingura on why true advantage is not about luxury, but about lifting others up.",
    author: "Hillary Turyasingura",
    role: "Founding team",
    date: "2023-03-01",
    location: "Uganda",
    category: "Leadership reflection",
    heroImage: "/images/stories/what-we-mean-advantage-hero.webp",
    heroImageAlt:
      "Hillary Turyasingura stands on a green hillside overlooking a broad mountain valley beneath a blue, cloud-filled sky.",
    relatedProjectSlugs: ["savegirl-uganda"],
    consentClassification: "verified",
    body: `There is a word in our name that people often misread before they have spent any real time with us: *Vantage*. It can sound like it belongs to a different world — the world of first-class lounges, corner offices and cars that turn heads on the way into them. That is not the world we mean. It is worth saying plainly what we do mean, because the difference shapes everything we do.

As founding-team member Hillary Turyasingura put it:

> "Advantage isn't about driving the latest cars or flying first class. It's about how that elevated post helps your people. It's about bringing people together and making lives better."

That single sentence carries the philosophy behind Vantage Foundation Uganda, and it is worth sitting with for a moment.

## Advantage as a Vantage Point, Not a Trophy

The word *advantage* came into English through the Anglo-French *avantage*, from *avant*, meaning "before". *Vantage* shares the same root. The word's early sense described the position of being ahead — a better position from which to see and act.

Somewhere along the way, in much of modern life, that meaning became flattened. Advantage became a synonym for accumulation: more comfort, more visibility, more distance between yourself and everyone else.

We think that is a diminished version of the word. If a vantage point only exists to be looked at from below, it has lost its purpose. A watchtower that only displays the person standing in it, and never watches over anything, is not doing what it was built for. The reason to climb higher is to see farther — to notice what others cannot yet see, to spot the need before it becomes a crisis and to find the path that is not visible from the ground.

That is the advantage we are interested in. Not status. Not a better view of yourself in the mirror. A better view of the people around you, and the responsibility that view creates.

## Elevation That Points Outward

Every one of us who works with or supports this foundation occupies some kind of elevated post, whether we think of it that way or not. It might be access to an education. It might be a network, a skill, a platform, capital, time or simply the stability that lets you plan further than a week ahead. These are not things to feel guilty about. They are, quite literally, advantages — positions from which you can see and reach further than someone without them.

The question we keep returning to is not *how do we get more of these?* but *what do we do with the ones we already have?* An elevated post that only serves the person standing on it is a wasted opportunity. It is a resource sitting idle. But an elevated post used to look out for others — to spot who is struggling, to build a bridge, to pass down what you have learned or to open a door you once had to force open yourself — becomes something else entirely. It becomes leverage for a whole community, not just a single life.

This is why we value the groundwork behind visible moments of change: the mentorship session, the reading circle, the health lesson, the financial-literacy workshop and the conversation that helps a young person see a new path. These efforts may not always make headlines, but together they help communities build confidence, knowledge and lasting support.

## Bringing People Together

The second half of that founding belief matters just as much as the first: advantage is about bringing people together. Real elevation is rarely a solitary act. The most lasting change we have seen does not come from a single person deciding to help from a distance. It comes from people standing shoulder to shoulder, sharing what they know and building something none of them could have built alone.

This is a deliberate departure from a model of charity that positions the giver above and the receiver below. We do not believe in that geometry. The communities we work alongside are not projects to be managed from a height; they are partners with their own knowledge, resilience and vision for what a better life looks like. Our role is to bring resources, connections and tools into that partnership — not to hand down a plan and walk away.

That is the "together" in our approach. It is not a soft word we add for warmth. It is a structural choice about how change actually happens: with communities, not for them.

## What This Looks Like in Practice

In practical terms, this belief becomes a simple filter for every project we take on. We ask whether an initiative genuinely equips people with tools, knowledge and support they can build with long after we have stepped back — or whether it simply makes us feel useful in the moment. We ask whether we are listening as much as we are offering. We ask whether the advantage involved in any partnership is actually reaching the people it is meant to reach, or getting absorbed somewhere along the way.

It is a demanding standard, and we do not always meet it perfectly. But it is the right standard, because it keeps the word *vantage* honest. It reminds us, every time we use it, that a better position is only worth having if it helps you see — and serve — the people who do not yet share it.

## A Different Kind of Elevation

So when we talk about advantage, we are not talking about the trappings that usually come to mind. We are talking about a vantage point used the way it was meant to be used: to look outward, to notice more, to reach farther and to bring more people up alongside you rather than simply standing taller than them.

That is the belief this foundation is built on. Not status. Not visibility. Just the conviction that whatever elevated post any of us occupies is only meaningful in proportion to how much it helps the people around us build better lives — together.`,
  },
  {
    id: "a-journey-from-pads-to-mentorship",
    slug: "a-journey-from-pads-to-mentorship",
    title: "A journey from pads to mentorship",
    excerpt:
      "How SaveGirl Uganda grew from a crowdfunding campaign for sanitary pads into a holistic mentorship movement.",
    author: "Vantage Foundation team",
    role: "Programme team",
    date: "2023-06-01",
    location: "Rural Uganda",
    category: "Programme update",
    heroImage: "/images/photos/photo-016.webp",
    heroImageAlt:
      "A facilitator in a pink \"SaveGirl Uganda\" shirt teaches at a classroom chalkboard while students listen.",
    consentClassification: "verified",
    relatedProjectSlugs: ["savegirl-uganda", "menstrual-cups-project"],
    body: `SaveGirl Uganda began as a simple idea: crowdfund money to buy sanitary pads for young women in rural areas who could not afford them. The response was immediate and generous. But as we met the young women we were serving, we realised that pads alone would not remove the barriers they faced.

Period poverty is connected to low self-esteem, limited financial literacy, lack of mentorship and few safe spaces. So we restructured SaveGirl into a mentorship programme. Today it combines menstrual health education, life-skills training, financial literacy and ongoing support — and has reached about 500 young women and men across rural Uganda.`,
  },
  {
    id: "women-day-bushenyi-2023",
    slug: "women-day-bushenyi-2023",
    title: "International Women's Day 2023 in Bushenyi",
    excerpt:
      "A day of conversation, celebration and empowerment at Basajjabalaba High School.",
    author: "Vantage Foundation team",
    role: "Programme team",
    date: "2023-03-08",
    location: "Basajjabalaba High School, Bushenyi",
    category: "Event highlight",
    heroImage: "/images/photos/photo-038.webp",
    heroImageAlt:
      "Students and teachers gather in a school hall for a Women's Day celebration, with panelists seated at a front table beneath chalkboard notes.",
    consentClassification: "verified",
    relatedProjectSlugs: ["savegirl-uganda", "mental-health-financial-literacy-workshops"],
    body: `On International Women's Day 2023, the Vantage Foundation team joined students and staff at Basajjabalaba High School in Bushenyi for a day of conversation, celebration and empowerment.

The event focused on confidence, education and the power of young women to shape their own futures. It was a reminder that progress happens when communities come together to support girls.`,
  },
  {
    id: "youth-conference-bushenyi",
    slug: "youth-conference-bushenyi",
    title: "Youth Conference on Financial Literacy and Career Education",
    excerpt:
      "Bringing financial literacy, habit building and career guidance to young people in Bushenyi.",
    author: "Vantage Foundation team",
    role: "Programme team",
    date: "2022-09-10",
    location: "Bushenyi, Uganda",
    category: "Event highlight",
    heroImage: "/images/projects/bushenyi-youth-conference-27.webp",
    heroImageAlt:
      "Young people in matching branded t-shirts gather at the Bushenyi youth conference on financial literacy and career education.",
    consentClassification: "verified",
    relatedProjectSlugs: ["advantage-book-club", "mental-health-financial-literacy-workshops", "savegirl-uganda"],
    body: `On 10 September 2022, our SaveGirl Uganda team hosted a youth conference in Bushenyi bringing together young people for sessions on financial literacy, habit building and career education. The day was designed to fill gaps left by the formal school system, giving participants practical skills they can use immediately.

The conference was held in official partnership with [Girl Power USA](https://girlpowerusa.org/girl-power-usa-and-save-girl-uganda-youth-conference/), a US-based 501(c)(3) nonprofit, which sponsored two guest speakers to fly in and address attendees: Chipiwa Mukono, Director of Finance and Investments at Girl Power Talk (Zimbabwe), and Marion Nekesa, Senior Writer at Girl Power Talk (Kenya). Vantage Foundation Uganda co-founders Kauthar Wangi and Hillary Turyasingura hosted and presented alongside them.

From budgeting to goal-setting, the conversations were energetic and honest. Young people left with tools, contacts and a renewed sense of direction.`,
  },
  {
    id: "mental-health-high-school-kampala",
    slug: "mental-health-high-school-kampala",
    title: "Mental Health Mentorship in Kampala",
    excerpt:
      "A high-school mentorship session that opened up safe conversations about mental health.",
    author: "Vantage Foundation team",
    role: "Programme team",
    date: "2023-09-01",
    location: "Kampala, Uganda",
    category: "Event highlight",
    heroImage: "/images/photos/photo-073.webp",
    heroImageAlt:
      "A large classroom of secondary school students in uniforms and headscarves sits at wooden desks during an assembly.",
    consentClassification: "verified",
    relatedProjectSlugs: ["mental-health-financial-literacy-workshops"],
    body: `At a high school in Kampala, our team led a mentorship session focused on mental health. The conversation covered stress, coping skills, seeking help and supporting friends.

For many students, it was the first time mental health had been discussed openly in school. The session created a safe space for questions and reflection, and several students signed up for follow-up activities.`,
  },
  {
    id: "the-greatest-impact-serving-others",
    slug: "the-greatest-impact-serving-others",
    title: "The greatest impact is found in serving others",
    excerpt:
      "A young medical doctor and volunteer reflects on the impact of service, the power of compassion, and why volunteering is about more than giving.",
    author: "Oliyer Abwooli Kabagenyi",
    role: "Medical doctor and volunteer",
    date: "2026-08-04",
    location: "Uganda",
    category: "Volunteer voice",
    heroImage: "/images/photos/community-health-camp-checkup.webp",
    heroImageAlt:
      "A volunteer medical professional conducts a health check-up on a community member at a rural health camp.",
    consentClassification: "verified",
    relatedProjectSlugs: ["savegirl-uganda", "rural-medical-camps"],
    body: `Volunteering has always been about the impact for me. It has always been about people. Every act of kindness, every conversation, and every opportunity to serve reminds me that we all have the ability to make someone's life a little better. I always wanted to be part of the positive change. That belief is what inspired me to join Vantage Foundation Uganda as a volunteer in 2021, and it continues to motivate me today.

Growing up and later pursuing a career in medicine, I came to appreciate how much a person's life can change when someone chooses to care. Sometimes people need financial support, but many times they simply need someone who believes in them, listens to them, and reminds them that their dreams are valid. Volunteering allows me to be that person for someone else.

One of the most memorable experiences in my journey with Vantage Foundation was being part of the team that organized the Save Girl Conference in Bushenyi. Seeing young girls gather with hope, eager to learn and be encouraged, was incredibly fulfilling. It reminded me that empowering one girl has the potential to transform an entire family and, ultimately, a community. Knowing that I contributed, even in a small way, to creating that opportunity reinforced why I value service so deeply.

What I treasure most about volunteering is not only the opportunity to give but also the meaningful connections that are created along the way. I have met passionate individuals who selflessly dedicate their time and talents to improving the lives of others. These relationships have inspired me, challenged me to grow, and reminded me that positive change is possible when people unite around a shared purpose.

Charity, to me, is an expression of compassion. It is about recognizing the dignity and potential in every individual and choosing to act with generosity, even when no reward is expected. I believe that genuine service creates a ripple effect. A single act of kindness can inspire another, and over time, those small acts become lasting change.

As a young medical doctor, volunteering has also shaped the kind of professional I aspire to be. It has taught me empathy, humility, teamwork, and the importance of serving communities beyond the walls of a hospital. These lessons continue to influence both my personal life and my career.

Looking ahead, I hope Vantage Foundation Uganda continues to expand its impact by empowering young people with practical skills that enable them to create opportunities for themselves and for others. Beyond inspiring volunteerism, I would love to see more initiatives focused on entrepreneurship, innovation, leadership, and mentorship — programmes that equip young people to become job creators rather than job seekers. When young people are empowered to identify problems, develop solutions, and build sustainable livelihoods, they not only transform their own lives but also uplift their communities.

Looking back on my journey since 2021 fills me with gratitude. I feel proud of myself for having made the decision. Vantage Foundation Uganda has given me more than a platform to serve — it has given me a family of changemakers, opportunities to grow, and experiences that have strengthened my commitment to making a difference. As long as I am able, I will continue to volunteer because I believe that the greatest impact we can make is found in serving others with compassion, purpose, and love.`,
  },
];

export function getStoryBySlug(slug: string): Story | undefined {
  return stories.find((s) => s.slug === slug);
}

export function getStorySlugs(): string[] {
  return getPublishedStories().map((s) => s.slug);
}

/**
 * Returns stories that are published. In development, all stories are
 * returned (including unpublished ones for previewing). In production,
 * only stories with `published !== false` are returned.
 */
export function getPublishedStories(): Story[] {
  const isDev = process.env.NODE_ENV === "development";
  return stories
    .filter((s) => isDev || s.published !== false)
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}
