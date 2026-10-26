#!/usr/bin/env python3
"""Build the remaining role, industry, and role-industry landing pages."""

from __future__ import annotations

import json
import re
import subprocess
import sys
import zlib
from pathlib import Path
from urllib.parse import quote

ROOT = Path(__file__).resolve().parents[1]
PYTHON = ROOT / ".venv" / "Scripts" / "python.exe"
DATA_DIR = ROOT / "data" / "pages"
BASE_URL = "https://www.kovcareeragency.org"
REVIEWED = "2026-10-23"
MARKETS = [
    ("Saudi Arabia", "/markets/executive-career-support-saudi-arabia.html"),
    ("UAE", "/markets/executive-job-search-uae.html"),
    ("United Kingdom", "/markets/executive-job-search-london.html"),
    ("Dubai", "/markets/executive-job-search-dubai.html"),
    ("Australia", "/markets/executive-career-support-australia.html"),
    ("Africa", "/markets/executive-job-search-africa.html"),
]


def role(slug: str, name: str, group: str, remit: str, evidence: str,
         stakeholders: str, documents: str, risks: str, industries: list[str] | None = None) -> dict:
    return {
        "slug": slug,
        "name": name,
        "group": group,
        "remit": remit,
        "evidence": evidence,
        "stakeholders": stakeholders,
        "documents": documents,
        "risks": risks,
        "industries": industries,
    }


ROLES = [
    role("ceo", "Chief Executive Officer", "C-suite", "set organization-wide direction and coordinate executive work",
         "mandate, governance interface, operating scope, and attributable outcomes",
         "board members, owners, executive colleagues, employees, customers, and external partners",
         "executive resume, board biography, leadership summary, and professional profile",
         "claiming sole credit for collective outcomes or relying on title instead of mandate"),
    role("coo", "Chief Operating Officer", "C-suite", "align operating functions, delivery systems, and organizational priorities",
         "operating scale, service or product delivery, cross-functional change, and decision rights",
         "CEO, functional leaders, frontline managers, suppliers, employees, and customers",
         "executive resume, operating-impact summary, leadership biography, and profile",
         "describing activity without showing scope, dependencies, or the candidate's contribution"),
    role("cfo", "Chief Financial Officer", "C-suite", "lead financial stewardship and connect resource decisions to organizational priorities",
         "financial leadership scope, planning, controls, capital or resource choices, and communication",
         "CEO, board or owners, finance teams, business leaders, lenders, investors, and auditors where applicable",
         "executive resume, finance leadership profile, board biography, and achievement summary",
         "presenting financial outcomes without context, attribution, or permission to disclose"),
    role("cto", "Chief Technology Officer", "C-suite", "set technology direction and connect technical choices with product and business needs",
         "technology strategy, architecture or product scope, delivery, teams, risk, and measurable contribution",
         "CEO, product and engineering leaders, security, customers, employees, and suppliers",
         "executive resume, technology leadership profile, portfolio summary, and LinkedIn profile",
         "using tool lists as a substitute for leadership remit, delivery context, and trade-offs"),
    role("cio", "Chief Information Officer", "C-suite", "guide information systems, digital operations, and technology services for the organization",
         "systems scope, service reliability, data stewardship, transformation, governance, and adoption",
         "CEO, business units, technology teams, users, vendors, and oversight stakeholders",
         "executive resume, transformation summary, professional biography, and profile",
         "collapsing infrastructure, information, product, and digital responsibilities into one vague claim"),
    role("cmo", "Chief Marketing Officer", "C-suite", "shape marketing strategy, customer understanding, brand, and commercial communication",
         "market context, customer insight, portfolio decisions, team leadership, and attributable contribution",
         "CEO, sales and product teams, customers, agencies, employees, and channel partners",
         "executive resume, brand and growth narrative, leadership biography, and profile",
         "claiming revenue or brand movement without describing attribution and surrounding factors"),
    role("chro", "Chief Human Resources Officer", "C-suite", "guide people strategy, organizational capability, and workforce-related leadership",
         "people agenda, organization design, leadership support, workforce programs, and measured contribution",
         "CEO, board or owners, employees, people teams, line leaders, and external advisers",
         "executive resume, people-leadership profile, biography, and selected program summary",
         "using confidential employee details or presenting team-wide change as an individual result"),
    role("ciso", "Chief Information Security Officer", "C-suite", "lead information-security priorities and coordinate risk-informed protection",
         "security remit, risk decisions, operating model, incident leadership where authorized, and adoption",
         "CEO, technology teams, risk and legal colleagues, employees, customers, and oversight bodies as applicable",
         "executive resume, security leadership summary, profile, and sanitized case examples",
         "exposing sensitive controls or incidents, or overstating personal responsibility for shared security work"),
    role("general-counsel", "General Counsel / Chief Legal Officer", "C-suite", "lead legal judgment and connect legal advice with organizational decisions",
         "legal remit, advisory judgment, team scope, governance interaction, and business context",
         "CEO, board or owners, business leaders, legal colleagues, regulators where relevant, and outside advisers",
         "executive resume, legal leadership biography, practice summary, and professional profile",
         "confusing legal advice with business decision ownership or disclosing privileged information"),
    role("chief-revenue-officer", "Chief Revenue Officer", "C-suite", "coordinate revenue-facing functions around a coherent commercial direction",
         "commercial remit, customer segments, sales and marketing coordination, team scope, and attributable evidence",
         "CEO, sales, marketing, customer success, product teams, customers, and channel partners",
         "executive resume, commercial leadership profile, pipeline narrative, and biography",
         "claiming all commercial outcomes without defining team, market, timing, or attribution"),
    role("chief-product-officer", "Chief Product Officer", "C-suite", "guide product direction, portfolio choices, and the connection between users and delivery teams",
         "product strategy, portfolio scope, discovery, prioritization, delivery partnerships, and outcomes",
         "CEO, engineering, design, sales, support, customers, and product teams",
         "executive resume, product portfolio narrative, leadership biography, and profile",
         "listing launches without clarifying user need, decision role, trade-offs, and adoption context"),
    role("chief-strategy-officer", "Chief Strategy Officer", "C-suite", "support organization-wide choices by framing options, analysis, and strategic execution",
         "strategy remit, decision support, portfolio choices, implementation links, and influence",
         "CEO, board or owners, finance, business leaders, employees, and external partners",
         "executive resume, strategy portfolio, executive biography, and profile",
         "presenting recommendations as implemented outcomes or leaving ownership unclear"),
    role("board-director", "Board Director", "Board and ownership", "contribute oversight, inquiry, and strategic perspective within collective governance",
         "committee or board remit, preparation, judgment, relevant expertise, and collective contribution",
         "chair, fellow directors, management, owners, stakeholders, and governance professionals",
         "board biography, governance resume, skills matrix, and concise profile",
         "implying executive authority for board decisions or claiming confidential board outcomes"),
    role("non-executive-director", "Non-Executive Director", "Board and ownership", "provide independent challenge and strategic contribution distinct from management",
         "governance experience, constructive challenge, committee contribution, and relevant expertise",
         "chair, board colleagues, CEO, management, shareholders or members, and stakeholders",
         "board biography, non-executive profile, skills matrix, and governance resume",
         "confusing oversight with operational management or overstating independence"),
    role("chair", "Chair", "Board and ownership", "lead board effectiveness and support clear governance and decision-making",
         "meeting leadership, board composition, governance practice, relationships, and transition judgment",
         "directors, CEO, owners, members, committees, and relevant stakeholder groups",
         "chair biography, board resume, governance narrative, and public profile",
         "blurring chair and executive accountabilities or taking credit for collective decisions"),
    role("managing-director", "Managing Director", "Board and ownership", "lead a business, division, or organization according to its defined mandate",
         "operating scope, commercial or service accountability, leadership span, and decision authority",
         "owners, board, CEO, customers, employees, lenders or investors where relevant, and partners",
         "executive resume, business leadership biography, mandate summary, and profile",
         "assuming the title means the same authority across employers, countries, or ownership models"),
    role("managing-partner", "Managing Partner", "Board and ownership", "combine leadership responsibilities with the governance and professional context of a partnership",
         "partner-group mandate, management contribution, practice or business scope, and shared decisions",
         "partners, practice leaders, employees, clients, committees, and external stakeholders",
         "partner biography, leadership resume, practice summary, and profile",
         "presenting partner-group outcomes as individual decisions or ignoring shared governance"),
    role("partner", "Partner", "Board and ownership", "develop a practice or business while contributing to a shared ownership or partnership structure",
         "client or commercial contribution, practice leadership, collaboration, and shared responsibilities",
         "other partners, clients, colleagues, employees, referral sources, and practice leaders",
         "partner biography, practice profile, selected work summary, and professional profile",
         "revealing client information or overstating individual ownership of team results"),
    role("vp-sales", "Vice President of Sales", "VP level", "lead a sales organization and connect market priorities with execution",
         "team scope, customer segments, sales processes, forecasting discipline, and attributable contribution",
         "CEO or CRO, sales teams, marketing, product, customers, and channel partners",
         "executive resume, sales leadership profile, commercial achievements, and profile",
         "relying on headline figures without explaining team, territory, offer, and time period",
         ["technology-media-telecom","finance-insurance","retail-ecommerce","manufacturing","wholesale-distribution","consulting-professional-services","healthcare-social-care","hospitality-food-service"]),
    role("vp-marketing", "Vice President of Marketing", "VP level", "lead marketing teams and align brand, customer, and commercial priorities",
         "market insight, team leadership, portfolio decisions, channel mix, and attributable evidence",
         "CEO or CMO, sales, product, agencies, customers, and marketing teams",
         "executive resume, marketing portfolio, leadership summary, and profile",
         "claiming campaign results without describing audience, contribution, and measurement context",
         ["technology-media-telecom","finance-insurance","retail-ecommerce","consulting-professional-services","arts-entertainment-sports","hospitality-food-service","real-estate-leasing","healthcare-social-care"]),
    role("vp-engineering", "Vice President of Engineering", "VP level", "lead engineering organization, technical delivery, and capability development",
         "engineering scope, architecture choices, delivery systems, people leadership, and operational outcomes",
         "CTO or product leadership, engineering teams, security, users, and business stakeholders",
         "executive resume, engineering leadership profile, portfolio summary, and profile",
         "substituting technology keywords for evidence of scale, decisions, and delivery conditions",
         ["technology-media-telecom","finance-insurance","manufacturing","utilities","construction-engineering","transportation-logistics","healthcare-social-care","energy-mining-oil-gas"]),
    role("vp-operations", "Vice President of Operations", "VP level", "coordinate operational performance across teams, locations, or service lines",
         "operating remit, workflow choices, service quality, resources, and cross-functional contribution",
         "COO or business leader, site teams, customers, suppliers, and functional partners",
         "executive resume, operating portfolio, achievement summary, and profile",
         "claiming improvements without baseline, scope, constraints, or shared contributors",
         ["manufacturing","transportation-logistics","retail-ecommerce","hospitality-food-service","healthcare-social-care","business-support-facilities","utilities","agriculture-food-forestry"]),
    role("vp-finance", "Vice President of Finance", "VP level", "lead finance teams and translate financial information into decisions for a business area",
         "planning scope, financial controls, analysis, resource decisions, and communication",
         "CFO, business leaders, finance colleagues, auditors where relevant, and owners",
         "executive resume, finance leadership summary, profile, and selected achievement examples",
         "disclosing sensitive figures or presenting forecasts as realized results",
         ["finance-insurance","technology-media-telecom","manufacturing","real-estate-leasing","public-sector-government","healthcare-social-care","consulting-professional-services","holding-companies"]),
    role("vp-people", "Vice President of People", "VP level", "lead people programs and partner with managers on organizational capability",
         "people agenda, organization design, manager support, program scope, and employee experience",
         "CHRO, executives, people teams, employees, line managers, and advisers",
         "executive resume, people leadership portfolio, biography, and profile",
         "including identifiable employee matters or claims without appropriate context",
         ["technology-media-telecom","finance-insurance","healthcare-social-care","education","retail-ecommerce","manufacturing","public-sector-government","business-support-facilities"]),
    role("vp-product", "Vice President of Product", "VP level", "set product priorities and coordinate discovery, planning, and delivery",
         "portfolio scope, customer insight, prioritization, team influence, and product outcomes",
         "CPO or CEO, engineering, design, sales, support, and users",
         "executive resume, product portfolio, leadership narrative, and profile",
         "listing features shipped without explaining user problem, constraints, or adoption",
         ["technology-media-telecom","finance-insurance","healthcare-social-care","retail-ecommerce","manufacturing","education","transportation-logistics","arts-entertainment-sports"]),
    role("vp-strategy", "Vice President of Strategy", "VP level", "frame strategic choices and connect planning with operating decisions",
         "analysis, option framing, stakeholder alignment, implementation, and decision influence",
         "CEO or CSO, finance, business leaders, board or owners where relevant, and teams",
         "executive resume, strategy portfolio, decision narrative, and profile",
         "claiming strategy outcomes without distinguishing recommendation, sponsorship, and execution",
         ["consulting-professional-services","finance-insurance","technology-media-telecom","holding-companies","manufacturing","public-sector-government","healthcare-social-care","energy-mining-oil-gas"]),
    role("director-operations", "Director of Operations", "Director level", "manage operational delivery and improve coordination within a defined remit",
         "team or site scope, process ownership, service standards, and improvement contribution",
         "executives, managers, frontline teams, suppliers, and customers",
         "resume, operations achievement summary, professional profile, and interview examples",
         "describing process work without the operating context or the candidate's authority",
         ["manufacturing","transportation-logistics","retail-ecommerce","hospitality-food-service","healthcare-social-care","business-support-facilities","utilities","agriculture-food-forestry"]),
    role("director-finance", "Director of Finance", "Director level", "lead financial planning, reporting, or control activity for a function or organization",
         "team responsibility, planning cycle, reporting scope, decision support, and controls",
         "CFO, department leaders, finance teams, auditors where relevant, and managers",
         "resume, finance achievement brief, professional profile, and interview examples",
         "sharing nonpublic financial details or overstating sign-off authority",
         ["finance-insurance","manufacturing","real-estate-leasing","technology-media-telecom","public-sector-government","healthcare-social-care","education","holding-companies"]),
    role("director-engineering", "Director of Engineering", "Director level", "direct engineering teams and coordinate technical execution in a defined area",
         "technical scope, team leadership, delivery choices, quality practices, and cross-team work",
         "VP or CTO, engineering teams, product, security, operations, and users",
         "resume, technical leadership portfolio, profile, and delivery examples",
         "over-indexing on hands-on tools while omitting leadership scope and outcomes",
         ["technology-media-telecom","manufacturing","utilities","construction-engineering","energy-mining-oil-gas","transportation-logistics","healthcare-social-care","finance-insurance"]),
    role("director-marketing", "Director of Marketing", "Director level", "manage campaigns, channels, or marketing programs within a broader strategy",
         "audience, channel choices, budget or team remit, collaboration, and attributable results",
         "CMO or VP, sales, product, agencies, customers, and marketing colleagues",
         "resume, campaign portfolio, professional profile, and examples",
         "presenting campaign metrics without explaining objectives or contribution",
         ["technology-media-telecom","retail-ecommerce","finance-insurance","arts-entertainment-sports","hospitality-food-service","consulting-professional-services","real-estate-leasing","healthcare-social-care"]),
    role("director-sales", "Director of Sales", "Director level", "manage sales teams, accounts, or territories against an agreed commercial plan",
         "customer segment, territory or account scope, team contribution, and sales process",
         "sales executives, marketing, product, customers, and channel partners",
         "resume, sales achievement brief, profile, and interview examples",
         "claiming results without clarifying target, territory, team role, or sales cycle",
         ["technology-media-telecom","finance-insurance","retail-ecommerce","manufacturing","wholesale-distribution","consulting-professional-services","healthcare-social-care","hospitality-food-service"]),
    role("director-people", "Director of People", "Director level", "lead a people function or program and support managers through organizational change",
         "program scope, manager partnership, team responsibilities, and people-related outcomes",
         "CHRO or VP, employees, line leaders, people teams, and advisers",
         "resume, people-program portfolio, profile, and selected examples",
         "using sensitive workforce information or broad claims without context",
         ["technology-media-telecom","finance-insurance","healthcare-social-care","education","retail-ecommerce","public-sector-government","manufacturing","business-support-facilities"]),
    role("director-product", "Director of Product", "Director level", "lead a product area and align customer needs with team delivery",
         "product scope, discovery, prioritization, stakeholder coordination, and evidence of use",
         "CPO or VP Product, engineering, design, sales, support, and customers",
         "resume, product case studies, profile, and concise portfolio",
         "confusing product activity with product outcomes or disclosing confidential roadmaps",
         ["technology-media-telecom","finance-insurance","healthcare-social-care","retail-ecommerce","manufacturing","education","transportation-logistics","arts-entertainment-sports"]),
    role("director-legal", "Director of Legal", "Director level", "manage a legal team, practice area, or legal operations remit",
         "practice or advisory scope, team leadership, work prioritization, and business partnership",
         "General Counsel, business leaders, legal colleagues, external counsel, and relevant stakeholders",
         "resume, legal leadership profile, practice summary, and sanitized examples",
         "disclosing privileged or client-sensitive information or implying unheld authority",
         ["legal-services","finance-insurance","technology-media-telecom","healthcare-social-care","public-sector-government","consulting-professional-services","real-estate-leasing","holding-companies"]),
    role("head-legal", "Head of Legal", "Heads of function", "lead a legal function or specialist team and advise on decisions within its remit",
         "advisory scope, team structure, work management, risk judgment, and stakeholder partnership",
         "CEO or General Counsel, business leaders, legal colleagues, outside counsel, and governance stakeholders",
         "legal leadership resume, practice biography, role summary, and discreet examples",
         "sharing privileged material or implying that legal advice alone owned business decisions",
         ["legal-services","finance-insurance","technology-media-telecom","healthcare-social-care","public-sector-government","consulting-professional-services","real-estate-leasing","holding-companies"]),
    role("head-growth", "Head of Growth", "Heads of function", "coordinate growth experiments and commercial initiatives for a defined business",
         "growth remit, customer insight, channels, collaboration, and attributable learning",
         "CEO or CRO, marketing, sales, product, analytics, and customers",
         "resume, growth portfolio, experiment summaries, and professional profile",
         "claiming all movement as growth impact without describing attribution or context",
         ["technology-media-telecom","finance-insurance","retail-ecommerce","consulting-professional-services","real-estate-leasing","arts-entertainment-sports","hospitality-food-service","other-services"]),
    role("head-strategy", "Head of Strategy", "Heads of function", "coordinate planning and strategic analysis for an organization or business unit",
         "problem framing, analysis, stakeholder alignment, recommendation, and implementation support",
         "CEO or CSO, finance, business leaders, teams, and board or owners when appropriate",
         "resume, strategy portfolio, planning narrative, and profile",
         "taking credit for decisions made by sponsors or treating planning as implementation",
         ["consulting-professional-services","finance-insurance","technology-media-telecom","holding-companies","manufacturing","public-sector-government","healthcare-social-care","energy-mining-oil-gas"]),
    role("head-data-ai", "Head of Data and AI", "Heads of function", "lead data capabilities and coordinate responsible application of analytical or AI work",
         "data products, team scope, quality practices, governance partnership, and decision value",
         "technology and business leaders, analysts, engineers, users, legal or risk colleagues",
         "resume, data leadership portfolio, project summaries, and professional profile",
         "exposing sensitive datasets, overstating model capability, or omitting human oversight",
         ["technology-media-telecom","finance-insurance","healthcare-social-care","manufacturing","retail-ecommerce","public-sector-government","education","consulting-professional-services"]),
    role("head-compliance", "Head of Compliance", "Heads of function", "coordinate compliance programs and support consistent interpretation of organizational obligations",
         "program remit, monitoring or training scope, issue handling, escalation, and cross-team work",
         "executives, legal and risk functions, employees, customers, and regulators where relevant",
         "resume, compliance leadership profile, program summary, and sanitized examples",
         "making jurisdictional claims without qualification or disclosing sensitive case details",
         ["finance-insurance","healthcare-social-care","technology-media-telecom","public-sector-government","manufacturing","energy-mining-oil-gas","transportation-logistics","legal-services"]),
    role("head-business-development", "Head of Business Development", "Heads of function", "develop relationships and opportunities that support an organization's commercial direction",
         "market focus, partnerships, opportunity pipeline, negotiation role, and attributable contribution",
         "CEO or CRO, sales, marketing, product, clients, partners, and industry contacts",
         "resume, partnership portfolio, business-development narrative, and profile",
         "presenting discussions as signed business or revealing sensitive counterpart information",
         ["consulting-professional-services","technology-media-telecom","finance-insurance","construction-engineering","wholesale-distribution","healthcare-social-care","real-estate-leasing","energy-mining-oil-gas"]),
]

INDUSTRIES = [
    {"slug":"agriculture-food-forestry","name":"Agriculture, Food and Forestry","model":"production linked to land, biological cycles, processing, and supply relationships","stakeholders":"producers, workforce, buyers, processors, logistics partners, and communities","tension":"seasonality, input availability, quality variation, and coordination across production stages","evidence":"resource planning, safety-minded operations, supplier relationships, yield or quality context, and continuity decisions","questions":"where the organization sits in the value chain, what assets and teams the role covers, and how decisions respond to variable conditions"},
    {"slug":"energy-mining-oil-gas","name":"Energy, Mining and Oil and Gas","model":"asset-intensive work spanning development, extraction, generation, processing, or energy services","stakeholders":"asset owners, technical teams, contractors, customers, communities, investors, and oversight stakeholders","tension":"long-lived assets, capital choices, operational continuity, workforce coordination, and changing demand","evidence":"project and asset scope, operating discipline, risk communication, workforce leadership, and substantiated delivery outcomes","questions":"which assets and activities the role covers, how capital and operating decisions are shared, and what specialist knowledge is expected"},
    {"slug":"utilities","name":"Utilities","model":"essential network or service operations with continuity, infrastructure, and customer responsibilities","stakeholders":"customers, communities, technical operators, owners, public bodies, suppliers, and oversight stakeholders","tension":"reliability, infrastructure renewal, service access, affordability, and long-term planning","evidence":"service scope, asset or network decisions, continuity planning, stakeholder communication, and team coordination","questions":"the service territory, operating remit, ownership context, and responsibilities that the employer assigns to this position"},
    {"slug":"construction-engineering","name":"Construction and Engineering","model":"project-based delivery involving design, procurement, technical coordination, and site execution","stakeholders":"clients, project teams, designers, contractors, suppliers, workers, and asset users","tension":"scope control, sequencing, interfaces, safety-minded work, and coordination across project phases","evidence":"project complexity, commercial or technical decisions, interface management, delivery contribution, and lessons learned","questions":"the project portfolio, delivery model, decision authority, and how the role works with technical and site leaders"},
    {"slug":"manufacturing","name":"Manufacturing","model":"conversion of materials into products through coordinated processes, equipment, people, and quality systems","stakeholders":"employees, suppliers, customers, engineering, operations, distribution, and ownership","tension":"production planning, equipment capacity, quality, workforce capability, and customer demand","evidence":"plant or product scope, process decisions, quality or delivery context, team leadership, and improvement work","questions":"which products, facilities, or value streams are in scope and how engineering, supply, and operations share decisions"},
    {"slug":"wholesale-distribution","name":"Wholesale and Distribution","model":"movement and availability of goods through purchasing, inventory, channel, and delivery relationships","stakeholders":"suppliers, retailers, business customers, logistics teams, sales, and inventory operators","tension":"availability, working capital, fulfillment coordination, customer terms, and supplier variability","evidence":"channel or category scope, inventory and service context, commercial coordination, and customer outcomes","questions":"the customer base, product range, distribution footprint, and relationship between sales, sourcing, and operations"},
    {"slug":"retail-ecommerce","name":"Retail and E-commerce","model":"customer-facing commerce through stores, digital channels, merchandising, service, and fulfillment","stakeholders":"customers, store or digital teams, suppliers, brand partners, operations, and owners","tension":"customer experience, assortment, inventory, channel coordination, and rapid feedback","evidence":"customer or category scope, channel decisions, team leadership, service context, and attributable commercial contribution","questions":"the channel mix, customer segment, operating footprint, and whether the remit centers on brand, product, service, or fulfillment"},
    {"slug":"transportation-logistics","name":"Transportation and Logistics","model":"movement, handling, and coordination of people or goods across routes and operating networks","stakeholders":"customers, operators, drivers, dispatch teams, asset owners, suppliers, and communities","tension":"network coordination, service windows, asset availability, safety-minded decisions, and disruption response","evidence":"route or network scope, service performance context, asset choices, workforce coordination, and customer communication","questions":"the services and geographies included, how the role interfaces with operators, and which service measures are within its control"},
    {"slug":"technology-media-telecom","name":"Technology, Media and Telecom","model":"digital products, platforms, content, communications, or technology-enabled services","stakeholders":"users, product and engineering teams, customers, creators, advertisers, partners, and investors","tension":"product evolution, reliability, audience or customer needs, technical choices, and changing business models","evidence":"product or platform scope, users served, team collaboration, delivery decisions, and evidence of adoption or service quality","questions":"whether the organization sells products, services, content, connectivity, or a mix, and how the role links technical and commercial priorities"},
    {"slug":"finance-insurance","name":"Finance and Insurance","model":"financial products and services supported by customer relationships, information, operations, and oversight","stakeholders":"customers, advisors, product teams, investors, counterparties, employees, and oversight stakeholders","tension":"trust, information handling, product suitability, operational resilience, and competing customer and business needs","evidence":"business or portfolio scope, decision processes, customer context, control partnership, and carefully attributable outcomes","questions":"the product and customer context, decision boundaries, control partnerships, and any requirements specific to the position and location"},
    {"slug":"real-estate-leasing","name":"Real Estate and Leasing","model":"property ownership, development, brokerage, management, or leasing relationships","stakeholders":"owners, tenants, customers, investors, property teams, suppliers, and communities","tension":"asset decisions, occupancy or customer needs, capital planning, service coordination, and market conditions","evidence":"asset or portfolio scope, customer and tenant relationships, project or operations decisions, and attributable contribution","questions":"whether the organization owns, develops, leases, manages, or advises on assets and which part of that work the role leads"},
    {"slug":"legal-services","name":"Legal Services","model":"legal advice, representation, transactions, dispute work, or related professional services","stakeholders":"clients, lawyers, professional staff, partners or owners, business leaders, and relevant authorities","tension":"professional judgment, client service, confidentiality, practice operations, and shared leadership","evidence":"practice or business scope, client-service context, team leadership, governance interface, and authorized examples","questions":"the employing entity, service model, role mandate, decision rights, and any qualification or authorization requirement"},
    {"slug":"consulting-professional-services","name":"Consulting and Other Professional Services","model":"expertise-led advisory or delivery work provided to organizations or individuals","stakeholders":"clients, practitioners, project teams, partners or owners, suppliers, and professional communities","tension":"expertise, client expectations, capacity, project economics, and consistent delivery across engagements","evidence":"service line, client or project context, team leadership, delivery model, and authorized outcomes","questions":"which services and clients the organization serves, how the role manages capacity, and what contribution is expected beyond subject expertise"},
    {"slug":"holding-companies","name":"Holding Companies and Corporate Groups","model":"ownership or coordination of multiple entities, portfolios, or operating businesses","stakeholders":"owners, boards, portfolio leaders, finance teams, employees, and external partners","tension":"delegated authority, portfolio priorities, governance interfaces, shared services, and entity-level differences","evidence":"portfolio or entity scope, oversight relationships, capital or operating choices, and contribution boundaries","questions":"which entities the role covers, what decisions are centralized, and where operating-company leaders retain authority"},
    {"slug":"business-support-facilities","name":"Business Support and Facilities","model":"support services, workplace operations, facilities, administration, or outsourced capabilities","stakeholders":"internal clients, employees, service teams, suppliers, customers, and contract owners","tension":"service levels, cost and capacity decisions, vendor relationships, workplace needs, and continuity","evidence":"service portfolio, team or site scope, vendor coordination, customer feedback, and operational improvements","questions":"which services are in scope, whether delivery is internal or contracted, and how service priorities are agreed"},
    {"slug":"education","name":"Education","model":"learning services delivered through institutions, programs, technology, or educational support","stakeholders":"learners, families, educators, administrators, owners or boards, and community partners","tension":"learning aims, access, program delivery, workforce needs, and resource stewardship","evidence":"program or institutional scope, learner or service context, staff leadership, and improvement contribution","questions":"the institution type, learner groups, decision structure, and whether the role leads academic, operational, commercial, or support work"},
    {"slug":"healthcare-social-care","name":"Healthcare and Social Care","model":"care, health-related services, or social support delivered by teams and organizations","stakeholders":"people receiving services, families, care professionals, administrators, owners, and community partners","tension":"service quality, workforce coordination, access, continuity, and sensitive information","evidence":"service or organizational scope, team leadership, quality context, collaboration, and privacy-conscious examples","questions":"the service population, operating model, role boundaries, and qualifications or requirements that must be confirmed for the specific vacancy"},
    {"slug":"arts-entertainment-sports","name":"Arts, Entertainment and Sports","model":"creative, cultural, event, audience, or sporting activity supported by teams and organizations","stakeholders":"audiences, participants, creators, athletes, sponsors, venues, partners, and communities","tension":"creative or sporting purpose, audience engagement, event execution, partnerships, and resource decisions","evidence":"program or event scope, audiences served, partnership work, team coordination, and measurable contribution where available","questions":"the organization's mission and revenue model, the audiences or participants involved, and how the role balances creative, service, and commercial priorities"},
    {"slug":"hospitality-food-service","name":"Hospitality and Food Service","model":"guest-facing accommodation, food, venue, or experience services delivered through people and operations","stakeholders":"guests, employees, suppliers, owners, local partners, and service teams","tension":"guest experience, operating capacity, service consistency, workforce coordination, and supplier variability","evidence":"venue or service scope, team leadership, guest context, service design, and attributable operating contributions","questions":"the properties, concepts, service channels, and team responsibilities included in the role"},
    {"slug":"other-services","name":"Other Services","model":"personal, repair, membership, community, or specialized services not covered by the other target sectors","stakeholders":"customers or members, employees, service providers, owners, suppliers, and communities","tension":"service consistency, relationship quality, capacity, trust, and adaptation to customer needs","evidence":"service portfolio, customer or member context, team scope, delivery decisions, and substantiated outcomes","questions":"what services are central, who the organization serves, and which operating or relationship responsibilities sit with the role"},
    {"slug":"public-sector-government","name":"Public Sector and Government","model":"public administration, public programs, or services delivered under a public mandate","stakeholders":"residents, service users, elected or appointed leaders, public employees, partners, and oversight stakeholders","tension":"public purpose, stewardship, transparency, service access, and coordination across institutions","evidence":"program or service scope, stakeholder communication, team leadership, resource decisions, and public-purpose context","questions":"the public body, appointment context, mandate, accountability relationships, and any requirements specific to the position"},
]


def sentence(seed: int, options: list[str], **values: str) -> str:
    template = options[seed % len(options)]
    return template.format(**values)


def para(
    role_data: dict,
    industry: dict | None,
    stage: str,
    index: int,
    sentence_categories: tuple[int, ...] | None = None,
) -> str:
    name = role_data["name"]
    remit = role_data["remit"]
    evidence = role_data["evidence"]
    stakeholders = role_data["stakeholders"]
    risks = role_data["risks"]
    documents = role_data["documents"]
    industry_name = industry["name"] if industry else "a target organization"
    model = industry["model"] if industry else f"an operating model that shapes how {stakeholders} work together"
    tension = industry["tension"] if industry else f"the priorities and shared decisions attached to {remit}"
    industry_stakeholders = industry["stakeholders"] if industry else stakeholders
    industry_evidence = industry["evidence"] if industry else evidence
    concerns = industry["questions"] if industry else f"how {stakeholders} divide authority, advice, and delivery"
    seed = zlib.crc32(
        f"{role_data['slug']}:{industry['slug'] if industry else 'hub'}:{stage}:{index}".encode()
    )
    frames = [
        [
            f"For {name} work in {industry_name}, explain how the candidate could {remit}; connect that mandate to evidence of {evidence}.",
            f"The {name} remit to {remit} should be described through decisions and examples, especially evidence of {evidence} relevant to {industry_name}.",
            f"Position a {name} career by linking {remit} to {industry_evidence}, then clarify which part of that work the candidate actually owned.",
            f"A {name} candidate should show how {evidence} supported the work to {remit}, with the {industry_name} setting made explicit.",
            f"Rather than lead with seniority, a {name} profile can explain the responsibility to {remit} and use {industry_evidence} as evidence.",
            f"In a {industry_name} target, make the {name} contribution legible: describe how the candidate helped {remit} and what supports {evidence}.",
            f"Readers need to see what {name} work involved; connect {remit} with the candidate's own examples of {evidence} in {industry_name}.",
            f"A precise {name} story ties {evidence} to the mandate of {remit}, without suggesting that the title alone establishes fit.",
            f"To assess a {name} opportunity in {industry_name}, compare the stated remit to the candidate's record of {evidence}.",
            f"Show the {name} scope behind the title: how the candidate could {remit}, which decisions mattered, and where {evidence} demonstrates their contribution.",
        ],
        [
            f"The {industry_name} context involves {model}; examine how that structure affects {tension} before drawing conclusions about the {name} role.",
            f"Use {model} to frame research about {industry_name}, then ask how a {name} will work through {tension}.",
            f"For {industry_name}, establish whether {model} describes the target employer and how {tension} is reflected in its {name} mandate.",
            f"A candidate exploring {industry_name} should test the assumed link between {model} and {tension} against the actual {name} role description.",
            f"An employer's {industry_name} model may involve {model}; its implications for {tension} should be discussed, not presumed.",
            f"Ask what {model} means at this particular {industry_name} organization and how it changes the priorities assigned to a {name}.",
            f"Research for a {name} in {industry_name} becomes more focused when the candidate investigates {tension} alongside {model}.",
            f"Not every {industry_name} organization will handle {tension} alike. Confirm how {model} informs this {name} position.",
            f"Treat {model} as a question to validate in {industry_name}; the answer helps clarify the {name} mandate and its {tension}.",
            f"To understand the {industry_name} target, explore {model} and ask how a {name} is expected to respond to {tension}.",
        ],
        [
            f"In {industry_name}, {industry_stakeholders} may shape the work. A {name} example should separate direct responsibility from collaboration.",
            f"Explain how {stakeholders} contributed to the candidate's work and distinguish that shared context from evidence of {evidence}.",
            f"Use an example involving {industry_evidence} to describe the decision, the parties involved, and the candidate's role as a {name}.",
            f"Before presenting {industry_evidence}, determine how {industry_stakeholders} participated and which details are safe to discuss.",
            f"Preparation for a {name} conversation should address {concerns}; relate the response to {industry_evidence}, not speculation about hiring.",
            f"Map the {industry_name} relationships among {industry_stakeholders}; verify actual authority instead of inferring a reporting line.",
            f"An account of {industry_evidence} should identify the candidate's contribution and the involvement of {stakeholders}.",
            f"Consider how {industry_stakeholders} interact with a {name}; use examples of {industry_evidence} to show judgment and collaboration.",
            f"Discuss {industry_evidence} with care: a {name} candidate can explain contribution while omitting confidential or identifying facts.",
            f"The candidate's record of {evidence} should be set beside the role of {industry_stakeholders}, so shared results are attributed fairly.",
        ],
        [
            f"KOV can help a {name} candidate organize an agreed search approach for {industry_name}, including documents such as {documents}.",
            f"Candidate-side support from KOV may connect {name} positioning, relevant documents, and approved outreach, within the scope the candidate agrees.",
            f"For a {name} target, KOV can discuss how {documents} support the candidate's account of {evidence}; external steps require prior agreement.",
            f"The candidate decides whether to pursue a {name} opportunity. KOV can support agreed research and preparation concerning {industry_name}.",
            f"KOV's service scope for a {name} candidate can include document preparation and agreed search activity, but cannot promise an employer's response.",
            f"A consultation can clarify whether a {name} candidate needs positioning, document support, target research, or approved outreach for {industry_name}.",
            f"KOV works with the candidate to agree which {name} targets matter, how {documents} will be used, and whether communication is authorized.",
            f"The service plan should fit the candidate's {name} priorities; agree research, materials, and any outreach before contact occurs.",
            f"Where appropriate to the agreed service, KOV can help a {name} candidate prepare and coordinate approved next steps for {industry_name}.",
            f"Career representation remains candidate-led: KOV can support a {name} search, while the candidate approves the goals and disclosures.",
        ],
        [
            f"For {name} materials, manage the risk of {risks}; support claims with {evidence} and remove details that are not authorized for sharing.",
            f"Review each {name} example for {risks}, then describe the candidate's decisions without overstating their control over {stakeholders}.",
            f"Protect credibility in {industry_name} by addressing {risks} with a factual account of {evidence} and its limits.",
            f"A {name} candidate should be ready to explain {risks} without revealing confidential details or implying unsupported responsibility.",
            f"Keep the {name} narrative accurate where {risks} may arise: attribute shared work and disclose only information the candidate may use.",
            f"Before discussing {industry_evidence}, check whether {risks} could expose sensitive details or blur the candidate's decision boundary.",
            f"Good preparation for {name} work includes a safe way to explain {risks} and a clear distinction between fact and inference.",
            f"Where {risks} affects a career example, substitute an authorized summary that preserves the point about {evidence}.",
            f"The candidate can discuss {evidence} while protecting confidentiality by omitting names, restricted figures, and other identifying material.",
            f"Do not resolve uncertainty about {risks} through assumption; verify the requirement and use only supportable {name} claims.",
        ],
    ]
    sentences = [
        choices[(seed // (offset + 2) + index * (offset + 1)) % len(choices)]
        for offset, choices in enumerate(frames)
    ]
    if sentence_categories is not None:
        sentences = [sentences[category] for category in sentence_categories]
    if seed % 2:
        sentences.reverse()
    return " ".join(sentences)


def role_hub_sections(r: dict, all_roles: list[dict]) -> list[dict]:
    industry_set = [x for x in INDUSTRIES if r["industries"] is None or x["slug"] in r["industries"]]
    if r["slug"] == "ceo":
        industry_set = INDUSTRIES
    sections = []
    plan = [
        ("mandate", "Define the mandate before the title", "positioning"),
        ("kov-process", f"How KOV works with a {r['name']}", "service"),
        ("documents", f"Build {r['name']} documents around evidence", "documents"),
        ("role-context", f"How the {r['name']} role operates", "role"),
        ("search", f"Organize a {r['name']} job search", "search"),
        ("recruiter-lens", f"Prepare for conversations about {r['name']} work", "evaluation"),
        ("career-presentation", f"Present a coherent {r['name']} career story", "presentation"),
        ("representation", "Agree the scope of private career representation", "service"),
        ("mistakes", f"Common {r['name']} search mistakes and corrections", "mistakes"),
        ("markets", f"Run the search thoughtfully in each target market", "markets"),
    ]
    for idx, (sid, heading, stage) in enumerate(plan):
        paras = [para(r, None, stage, idx)]
        section = {"id": f"{r['slug']}-{sid}", "heading": heading, "paragraphs": paras}
        if sid == "documents":
            section["table"] = {
                "headers": ["Material", "Purpose for this role", "Candidate review"],
                "rows": [
                    ["Executive resume", r["documents"], "Confirm scope, dates, decision ownership, and evidence."],
                    ["Professional biography", f"Introduce the {r['name']} remit and relevant leadership perspective.", "Keep the summary accurate and suitable for its audience."],
                    ["Career evidence brief", r["evidence"], "Use only authorized and supportable examples."],
                    ["Online profile", f"Keep public positioning consistent with the target {r['name']} direction.", "Review visibility and disclose no confidential search details unless chosen."],
                ],
            }
            section["sample"] = {
                "heading": f"How we clarify a {r['name']} summary",
                "before": "Experienced leader responsible for important projects and teams.",
                "after": f"{r['name']} with a mandate to {r['remit']}, supported by examples that clarify {r['evidence']}.",
            }
        if sid == "mistakes":
            section["bullets"] = [
                f"Lead with title alone; correct it by stating the mandate and scope behind the {r['name']} position.",
                f"Use broad claims without proof; connect {r['evidence']} to a specific situation and attributable result.",
                f"Ignore shared decisions; explain how {r['stakeholders']} contributed and where your authority began and ended.",
                f"Reuse every document unchanged; adjust emphasis to the opportunity while keeping the underlying facts consistent.",
                f"Share sensitive material to demonstrate credibility; prepare an authorized, non-confidential account instead.",
                f"Contact an organization before agreeing boundaries; confirm recipient, message, and disclosure preferences first.",
            ]
        if sid == "markets":
            section["tabs"] = [
                {"name": m, "text": f"For a {r['name']} considering {m}, define the remit as {r['remit']}; use the candidate's evidence of {r['evidence']} to compare actual opportunities. Review KOV's existing market guidance, confirm location-specific questions with current sources, and agree which documents ({r['documents']}) or outreach steps are in scope before contact."}
                for m, _ in MARKETS
            ]
            section["cards"] = [
                {"title": "Dubai executive search", "text": "KOV's existing market page can help start a discussion about a Dubai-focused target and agreed search support.", "href": "/markets/executive-job-search-dubai.html", "linkText": "Review Dubai support"},
                {"title": "Career support in Australia", "text": "Explore KOV's existing Australia market page and discuss the location and role scope relevant to you.", "href": "/markets/executive-career-support-australia.html", "linkText": "Review Australia support"},
            ]
        if sid == "role-context":
            section["bullets"] = [
                f"Describe the decisions and responsibilities that belong to a {r['name']} in the target organization.",
                f"Separate individual accountability from the contributions of {r['stakeholders']}.",
                f"State which capabilities are direct experience and which are transferable.",
                f"Ask how the employer defines success, authority, and collaboration for the role.",
            ]
        sections.append(section)
    sections.append({
        "id": f"{r['slug']}-industry-guides",
        "heading": f"Industries where {r['name']} work takes different forms",
        "paragraphs": [
            f"A {r['name']} mandate to {r['remit']} can look different across organizations. Compare the decision rights, stakeholders, and evidence of {r['evidence']} in each setting rather than assuming a familiar title means familiar work.",
            f"Each industry card leads to a distinct context for considering {r['name']} opportunities. Use the guide to frame questions about {r['stakeholders']}, identify which parts of your experience transfer, and decide whether KOV's agreed research, positioning, or document support fits your target.",
        ],
        "cards": [
            {"title": x["name"], "text": f"Consider {r['name']} work in a setting shaped by {x['model']}.", "href": f"/roles/{r['slug']}/{x['slug']}.html", "linkText": f"{r['name']} in {x['name']}"}
            for x in industry_set
        ],
    })
    related = [x for x in all_roles if x["slug"] != r["slug"] and x["group"] == r["group"]][:3]
    if len(related) < 3:
        related += [x for x in all_roles if x["slug"] != r["slug"] and x not in related][:3-len(related)]
    sections.append({
        "id": f"{r['slug']}-related-roles",
        "heading": "Related career directions",
        "paragraphs": [
            f"Compare the {r['name']} mandate to adjacent roles by asking who owns the work to {r['remit']}, what evidence demonstrates {r['evidence']}, and how {r['stakeholders']} share decisions.",
            f"The neighboring guides are separate career paths, not interchangeable titles. Consider whether your strongest examples concern {r['documents']} or a different scope, and assess each opportunity against your own priorities.",
        ],
        "cards": [
            {"title": x["name"], "text": f"Explore a distinct guide to {x['remit']}.", "href": f"/roles/{x['slug']}/", "linkText": f"Explore {x['name']}"}
            for x in related
        ],
    })
    return sections


def hub_faqs(r: dict) -> list[dict]:
    return [
        {"question": f"What should a {r['name']} establish before approaching a new employer?",
         "answer": f"Map the employer's expectations against the {r['name']} remit to {r['remit']}. Identify the decisions that sit with the role, how {r['stakeholders']} contribute, and which examples substantiate {r['evidence']}. A target brief can record open questions, location preferences, and the work conditions that matter to the candidate. KOV can discuss research and positioning within an agreed engagement."},
        {"question": f"Which documents help explain a {r['name']} career?",
         "answer": f"Materials may include {r['documents']}, selected to suit the recipient and the opportunity. A {r['name']} resume can clarify scope and decisions; a biography can give a concise account of leadership perspective; supporting examples can explain {r['evidence']}. Keep dates and outcomes factual, attribute shared work, and remove confidential information."},
        {"question": f"How does KOV support a {r['name']} search?",
         "answer": f"KOV can discuss fit, target strategy, research, positioning, document support, approved outreach, and follow-up for a {r['name']} candidate, according to the service selected. Together, the candidate and KOV agree scope, materials, and permissions before external steps. Employers retain control of interviews and hiring decisions; the service does not promise a particular outcome."},
        {"question": f"How should a {r['name']} describe shared outcomes?",
         "answer": f"Set out the situation, the decision being made, and your own contribution. Explain how {r['stakeholders']} participated, where your authority began and ended, and how the example demonstrates {r['evidence']}. A precise attribution is more persuasive than claiming a collective result as an individual achievement."},
        {"question": f"Can KOV guarantee a {r['name']} interview or appointment?",
         "answer": f"No. KOV supports the candidate through agreed {r['name']} career services; organizations make their own decisions about interviews, offers, and appointments. KOV does not guarantee an introduction, response, job, or timetable. The candidate can decide whether the agreed process and support suit their needs."},
        {"question": f"How are market preferences handled for a {r['name']} search?",
         "answer": f"Name the intended location and the {r['name']} responsibilities sought, then review KOV's existing market guidance and verify practical requirements for each opportunity. The candidate and KOV agree research, scope, and any outreach; no market assumption substitutes for checking the actual role."},
    ]


def pair_paragraphs(r: dict, ind: dict, section: str, index: int) -> list[str]:
    role_name, role_remit = r["name"], r["remit"]
    role_evidence, role_risk = r["evidence"], r["risks"]
    stakeholders, documents = r["stakeholders"], r["documents"]
    industry_name, model = ind["name"], ind["model"]
    tension, sector_evidence = ind["tension"], ind["evidence"]
    sector_stakeholders, questions = ind["stakeholders"], ind["questions"]
    variants = {
        "context": [
            f"In {industry_name}, {model} frames the setting; it does not define one universal job. A {role_name} candidate should connect {role_remit} to a concrete decision that affected {tension}, then clarify what they owned and what depended on {sector_stakeholders}. KOV can help turn that account into a concise, supportable positioning statement.",
            f"The central question for a {role_name} considering {industry_name} is how the employer's work changes the meaning of {role_remit}. Use {sector_evidence} to show the candidate's contribution, and treat {model} as the operating context to investigate rather than proof of identical practices across organizations.",
            f"Start with the organization's described activity: {model}. Then test whether the candidate's record in {role_evidence} speaks to {tension} and the decisions attached to {role_remit}. The story should identify the role's boundaries and the people who shared the work, especially where {sector_stakeholders} have different interests.",
        ],
        "fit": [
            f"Compare the vacancy with the candidate's previous remit, not just its title. For a {role_name}, the practical test is whether experience in {role_evidence} can transfer to {sector_evidence} in an organization shaped by {model}. Record what is direct experience, what is transferable, and what should be explored before the candidate invests in the opportunity.",
            f"A move into {industry_name} may suit a {role_name} whose strongest examples concern {role_remit}; fit depends on whether the prospective role gives that work meaningful scope. Ask how {tension} appears in this employer's priorities and what the candidate wants to own, learn, or avoid.",
            f"Use {questions} to decide whether the target is worth pursuing. The candidate can compare those answers with their record of {role_evidence}, preferred working conditions, and appetite for {tension}. KOV can help define the criteria and prepare the case; the candidate makes the career decision.",
        ],
        "process": [
            f"KOV's work begins by clarifying the candidate's goals for a {role_name} move and the kinds of {industry_name} organizations under consideration. Together, they can turn {questions} into research prompts, identify relevant examples of {role_evidence}, and agree which individual services or representation activities fit the candidate's needs.",
            f"After target criteria are agreed, KOV can help organize the candidate's documents, prepare a focused positioning narrative, and conduct agreed research. Any outreach requires the candidate's prior approval of its audience and content. Interview preparation and follow-up are tailored to the opportunity, while the employer retains control of its own decisions.",
            f"Treat this as a sequence rather than a promise of placement: discuss scope, assess target fit, prepare materials, review research, and authorize any contact separately. For this {role_name}, the agreed brief should explain how {role_remit} relates to {model}; the candidate can pause or change direction as priorities evolve.",
        ],
        "documents": [
            f"Choose from {documents} according to the next audience. A {role_name} resume can establish scope; a biography can frame leadership context; a selected example can show how {role_evidence} connects to {sector_evidence}. KOV can edit and align these materials while the candidate confirms facts, attribution, and permission to disclose.",
            f"Build the written case around the actual {industry_name} remit. Select evidence that clarifies the candidate's decisions around {role_remit}, then explain why it matters in a setting where {tension}. Avoid {role_risk}; remove sensitive specifics without stripping away the reasoning or the candidate's role.",
            f"Use separate documents for separate jobs: the resume records career scope, the professional biography introduces the leadership perspective, and a concise evidence brief can connect {role_evidence} with {sector_evidence}. KOV can help choose emphasis for a {industry_name} audience without changing the underlying record.",
        ],
        "service-scope": [
            f"Individual career services may include resume or CV writing, career positioning, LinkedIn profile optimization, a professional biography, portfolio support, or interview coaching, as listed on KOV's candidate-services page. For this {role_name}, choose the items that best explain {role_evidence} in relation to {model}.",
            f"Private career representation is distinct from document work: it can include agreed strategy, target research, professional positioning, authorized outreach, and follow-up. A {role_name} candidate decides the goals and approves disclosure; KOV does not make hiring decisions or promise interviews, offers, or results.",
            f"A consultation can determine whether the candidate needs a focused document project, continuing career strategy, or private representation for an agreed search. The decision should reflect the {role_name}'s target in {industry_name}, the evidence available, and the level of direct involvement the candidate wants in research and communication.",
        ],
        "evaluation": [
            f"Prepare an example that connects {role_remit} to {tension}. Explain the situation, the candidate's decision, how {sector_stakeholders} participated, and the evidence that supports the outcome. This gives an employer a grounded account without guessing at a particular recruiter's or board's criteria.",
            f"Questions about {questions} can reveal whether the title carries the scope the candidate expects. KOV can help rehearse answers about {role_evidence} and prepare questions for the actual employer; avoid presenting general assumptions about {industry_name} as if they were confirmed selection rules.",
            f"Show how the candidate approaches a decision, not only what was delivered. For a {role_name}, discuss the trade-offs between {role_evidence} and the needs implied by {model}, explain collaboration with {stakeholders}, and distinguish individual authority from shared accountability.",
        ],
        "mistakes": [
            f"Two errors often weaken this positioning: describing {industry_name} as a single employer type and presenting the {role_name} title without its remit. Replace both with the target organization's stated work, a clear account of {role_remit}, and evidence relevant to {sector_evidence}.",
            f"Do not use {tension} as a claim of personal impact by itself. Explain the candidate's part in the work, how {stakeholders} contributed, and what supports {role_evidence}. Address {role_risk} by excluding protected details and making the limits of the example clear.",
            f"A generic document can obscure the specific value of a {role_name} in {industry_name}. Rework it to show the decisions behind {role_remit}, how those decisions related to {model}, and which details can safely be shared. Keep the candidate's account distinct from collective results.",
        ],
        "outreach": [
            f"Before contacting anyone, establish why this {industry_name} organization belongs on the candidate's list and how its work relates to {role_remit}. KOV can support research and an agreed message; the candidate approves the recipient, channel, timing, and disclosures. Research is not permission to make contact.",
            f"Keep the target brief specific: record the organization's stated activity, questions about {model}, and the candidate's reason for considering a {role_name} role. If an example touches {role_risk}, prepare a sanitized version before any external discussion.",
            f"Confidentiality decisions are part of the search design. Agree what may be shared about {role_evidence}, which organizations can be approached, and what must remain private. KOV can coordinate only the communication included in the service agreement and approved by the candidate.",
        ],
        "interview": [
            f"Prepare stories around the choices a {role_name} makes in relation to {tension}: what was at stake, who participated, and how the candidate contributed. Rehearse a concise explanation of {role_evidence} that fits the employer's stated remit rather than relying on a generic account of {industry_name}.",
            f"Use interview preparation to test the role as well as present the candidate. Clarify authority, reporting relationships, expectations around {role_remit}, and the way {sector_stakeholders} work with the position. If an offer develops, KOV can support negotiation as described on its service pages; the candidate decides whether to accept.",
            f"Translate the written narrative into conversation: explain the candidate's decisions, invite questions about {model}, and ask what the employer needs this {role_name} to address. Preparation can include likely discussion topics and negotiation priorities, without suggesting that KOV controls an interview or offer.",
        ],
        "markets": [
            f"Regional planning starts with the candidate's preferred location and the actual {role_name} remit. KOV's existing guidance covers Saudi Arabia, the UAE and Dubai, the United Kingdom and London, Australia, and Africa; use those pages as service context, then verify current requirements for the specific {industry_name} position.",
            f"Do not infer a local hiring rule from a market label. Compare the opportunity with {role_remit}, confirm questions about {model} from current information, and agree which documents or outreach are in scope. The candidate retains control of location preferences and external contact.",
            f"KOV can align agreed search work with the candidate's target geography, while the candidate checks role-specific conditions with the employer or relevant current sources. For this {role_name}, compare the evidence in {role_evidence} with the responsibilities actually described in {industry_name}; do not assume that a region changes the service boundaries.",
        ],
    }
    seed = sum(ord(char) for char in f"{r['slug']}:{ind['slug']}:{section}")
    return [variants[section][(seed + index) % len(variants[section])]]


def pair_page(r: dict, ind: dict, roles: list[dict]) -> dict:
    audience = f"{r['name']} candidates considering roles connected to {ind['name']}"
    answer = (f"KOV helps {audience} connect their actual leadership remit with {ind['model']}. "
              f"The work begins with target fit and evidence, then may include agreed research, professional positioning, approved outreach, and follow-up. "
              f"The candidate retains control of decisions; employers make hiring decisions.")
    section_specs = [
        ("context", f"How {r['name']} work connects with {ind['name']}"),
        ("fit", f"Who this {r['name']} and {ind['name']} guide is for"),
        ("process", "A candidate-led process from first discussion to next steps"),
        ("documents", f"Documents that make {r['name']} experience relevant here"),
        ("service-scope", "Choose the individual services that fit the work"),
        ("evaluation", f"Prepare to discuss the {ind['name']} mandate"),
        ("mistakes", f"Common positioning mistakes for {r['name']} candidates in {ind['name']}"),
        ("outreach", "Keep research, confidentiality, and outreach aligned"),
        ("interview", f"Prepare for conversations about {ind['name']} work"),
        ("markets", "Run the search thoughtfully in each target market"),
    ]
    sections = []
    narrative_focus = {
        "context": (0, 1, 2),
        "fit": (0, 1, 2),
        "process": (0, 1, 3),
        "documents": (0, 2, 4),
        "service-scope": (0, 2, 3),
        "evaluation": (0, 1, 2),
        "mistakes": (1, 2, 4),
        "outreach": (1, 3, 4),
        "interview": (0, 2, 3),
        "markets": (0, 1, 3),
    }
    for ix, (sid, heading) in enumerate(section_specs):
        paragraphs = [para(
            r, ind, sid, ix * 3, sentence_categories=narrative_focus[sid]
        )]
        if r["slug"] == "general-counsel" and sid == "context":
            if ind["slug"] == "arts-entertainment-sports":
                paragraphs.extend([
                    "A General Counsel considering an arts, entertainment, or sports organization may need to understand how creative work, events, participants, audiences, commercial partners, and operating teams meet in that employer's specific model. The candidate should be ready to describe how legal advice supported decisions among those groups, while protecting confidential matters and distinguishing advice from the business decision ultimately taken.",
                    "For this setting, useful career examples may involve collaboration around productions, venues, events, talent or participant relationships, sponsorship, or rights-related questions, depending on the actual organization and remit. KOV can help select appropriate examples, clarify the candidate's contribution, and prepare a concise narrative that connects counsel's work with the organization's stated priorities without implying a single standard structure.",
                ])
            elif ind["slug"] == "other-services":
                paragraphs.extend([
                    "For an organization grouped within Other Services, a General Counsel should first learn what the employer actually provides, who it serves, and how its operating model differs from another service business. The label spans varied activities, so the candidate's account should explain the specific setting rather than suggesting that one legal or commercial pattern applies to all employers.",
                    "Relevant examples might concern advice delivered alongside customer-facing teams, service operations, owners, suppliers, or membership relationships, depending on the candidate's experience and the role. KOV can help frame those examples around the candidate's remit, clarify what can be shared, and show how counsel contributed to decisions without claiming ownership of business outcomes.",
                ])
        sec = {"id": f"{r['slug']}-{ind['slug']}-{sid}", "heading": heading, "paragraphs": paragraphs}
        specific_context = {
            ("vp-engineering", "manufacturing"): (
                "For a manufacturing-focused example, choose an engineering decision tied to a defined product, facility, or production process. Explain the technical constraint, the handoff with operations or quality colleagues, and the candidate's authority over the trade-off; do not let a list of tools stand in for that account. KOV can shape the example for the target role, then review what may be shared before it appears in a resume, portfolio, or approved conversation."
            ),
            ("vp-engineering", "transportation-logistics"): (
                "A transportation or logistics engineering story can centre on systems that coordinate routes, assets, dispatch, or service information, depending on the employer's actual remit. Show how the candidate balanced technical design with operational users and service continuity, and separate their decision from the work of operators or vendors. KOV can select a suitable example, clarify the leadership contribution, and prepare a concise version for agreed target research or outreach."
            ),
            ("chief-revenue-officer", "technology-media-telecom"): (
                "For a revenue leader, the useful question is how the organization earns and retains customer value across its particular mix of products, platforms, content, or connectivity. Explain the candidate's commercial remit, the relationship among sales, marketing, product, and customer teams, and which results can fairly be attributed to their leadership. KOV can turn that evidence into a focused commercial narrative without presenting audience, pipeline, or customer information that the candidate is not authorized to disclose."
            ),
            ("cio", "technology-media-telecom"): (
                "An information-systems leader should distinguish internal technology services and enterprise platforms from customer-facing products or media offerings when the organization contains both. Describe the systems or transformation remit, how business users and technical teams shared decisions, and what adoption or service evidence is safe to cite. KOV can help make that boundary clear in the candidate's documents and prepare questions about the actual reporting line, service scope, and relationship with product or engineering leadership."
            ),
            ("chief-strategy-officer", "holding-companies"): (
                "A corporate group may combine entities with different markets, operating models, or degrees of central coordination. A strategy candidate should explain how options were framed across that portfolio, who sponsored decisions, and how recommendations connected to execution without claiming ownership of the group's outcomes. KOV can help select a permitted example, identify which organization-level details should remain confidential, and shape the narrative around the candidate's own decision support and implementation role."
            ),
            ("cio", "holding-companies"): (
                "For a group information-systems remit, establish whether the opportunity concerns shared platforms, entity-level services, data coordination, or some combination; do not infer a single operating model from the holding-company label. The candidate can describe how they handled system boundaries, user needs, and decision rights across stakeholders. KOV can organize a target-specific evidence brief and questions about central versus local authority, while keeping nonpublic architecture and business information out of public materials."
            ),
            ("non-executive-director", "finance-insurance"): (
                "A board-level candidate can relate oversight experience to the organization's actual financial products, customers, and control relationships without implying that all firms have the same governance structure. Select an example that shows disciplined inquiry, constructive challenge, and contribution to collective decisions; keep the distinction between board oversight and management clear. KOV can help prepare a concise board biography and evidence narrative, then agree what sensitive information may be used in any target discussion."
            ),
            ("non-executive-director", "transportation-logistics"): (
                "For an organization moving people or goods, board examples may be framed around service continuity, asset choices, customer relationships, or coordination across operating partners, where those subjects match the candidate's experience. Explain the question asked and the collective decision process rather than presenting board work as line management. KOV can help position the candidate's oversight contribution, prepare a board-focused biography, and remove commercial or operational details that are not approved for disclosure."
            ),
            ("chief-strategy-officer", "energy-mining-oil-gas"): (
                "Strategy work in an asset-intensive setting can involve comparing long-horizon choices, portfolio priorities, and operating assumptions, but the candidate should describe only the mandate they actually held. A strong example distinguishes analysis, sponsor decisions, and implementation ownership. KOV can help build that distinction into the career narrative, select authorized evidence, and prepare target-research questions about the position's scope rather than making unsupported claims about a company's plans."
            ),
            ("cto", "energy-mining-oil-gas"): (
                "A technology leader's account should identify whether the remit covered engineering systems, technical development, digital products, or another defined area; the title alone does not settle that question. Connect a technical choice to the operating or project context, show how the candidate worked with specialist teams, and clarify what was delivered versus proposed. KOV can shape a safe portfolio example and prepare questions about the employer's actual authority, interfaces, and expectations for the CTO."
            ),
            ("cio", "business-support-facilities"): (
                "In a business-support or facilities organization, an information-systems example may involve connecting service workflows, users, suppliers, and administrative platforms. Describe the candidate's remit and the change in service coordination without disclosing client or site information. KOV can help turn the work into an executive-level transformation story, identify which operational details can be shared, and prepare research questions about the role's relationship with service delivery and external providers."
            ),
            ("ciso", "business-support-facilities"): (
                "A security leader should make the governance and coordination contribution understandable without exposing controls, incidents, vulnerabilities, or client details. Explain how the role worked with technology, operations, legal, and service teams, and what authority the candidate actually held. KOV can help prepare a sanitized leadership example, distinguish risk oversight from technical implementation, and agree the level of disclosure before any document or outreach uses it."
            ),
            ("cio", "arts-entertainment-sports"): (
                "In creative or event-led organizations, a CIO or technology leader often serves a mix of production, operations, audience, and partner needs. A useful example separates technology governance from the content or event mandate, explains which users had decision rights, and shows how the candidate handled confidentiality or brand-sensitive trade-offs. KOV can help make that distinction explicit and prepare a short narrative for a target discussion without treating every creative enterprise as the same operating model."
            ),
            ("cmo", "arts-entertainment-sports"): (
                "A marketing example in arts or sports usually needs a clearer explanation of audience, participation, sponsorship, or franchise dynamics than a simple brand-growth claim. Describe the campaign or positioning decision, the stakeholder mix, and what part the candidate actually controlled. KOV can help turn that story into a concise, credible narrative that fits the organization rather than assuming every arts or entertainment employer uses the same commercial model."
            ),
            ("head-strategy", "finance-insurance"): (
                "For a strategy remit in financial services, the employer may define strategy around portfolios, underwriting, credit, distribution, or risk oversight, and the candidate's account should show which of those was within their scope. Explain the decision question, the stakeholder mix, and the constraints at play, rather than presenting the whole market as a single operating model. KOV can help select a permitted example and align the narrative to the specific target."
            ),
            ("vp-strategy", "finance-insurance"): (
                "An insurance or financial-services strategy example usually needs a sharper account of how the candidate supported different business lines or risk decisions. Show what was analyzed, which stakeholders had authority, and how the recommendation connected to implementation, while avoiding unsupported claims about market conditions or regulated disclosures. KOV can help prepare a written example that distinguishes strategic analysis from product or underwriting ownership."
            ),
            ("director-product", "technology-media-telecom"): (
                "A product example in technology or media benefits from a clear statement about platform, buyer, or content decisions, and whether the candidate owned product strategy or only supported it. Explain what was prioritized, the trade-offs, cross-functional dependencies, and the impact on users or engagement. KOV can help turn that into a concise product narrative that differs from a sales narrative for the same employer."
            ),
            ("director-sales", "technology-media-telecom"): (
                "A sales example in technology or media should show the account, buying cycle, and relationship dynamics in the particular sector, rather than implying a single selling motion. Explain the candidate's responsibility for deal creation, retention, or account planning, and separate it from product or marketing influence. KOV can help shape the evidence to reflect actual commercial scope and keep the narrative specific to the relevant employer."
            ),
            ("chief-strategy-officer", "consulting-professional-services"): (
                "Strategy work in a consulting or professional-services firm often sits between client delivery, practice leadership, and commercial development. A useful example distinguishes analysis, partner or client input, and the candidate's actual role in recommendations or implementation, rather than treating the whole firm as one model. KOV can help shape a scoped example that reflects the firm's operating logic and the candidate's decision rights."
            ),
            ("chair", "hospitality-food-service"): (
                "Board and chair examples in hospitality or food service benefit from a clear distinction between oversight, governance, and operational accountability. Explain how the candidate influenced strategy, risk, or capital decisions without implying that they directed day-to-day service operations. KOV can help prepare a board-appropriate case and keep the example different from a partner-level or operating-leadership story."
            ),
            ("managing-partner", "hospitality-food-service"): (
                "A managing partner story should explain how the candidate balanced firm leadership, client relationships, or investment choices with the operating realities of hospitality or food service. A stronger narrative identifies the decision problem, who had authority, and how the candidate helped resolve it without claiming responsibility for all operational outcomes. KOV can help structure that example around the actual role and the relevant commercial context."
            ),
            ("chief-strategy-officer", "healthcare-social-care"): (
                "Strategy work in healthcare and social care should be tied to stakeholder mix, care model, regulatory context, and service quality, rather than a generic corporate strategy label. Show how the candidate framed choices among service access, workforce, capacity, or continuity, and what part their analysis actually played in the decision. KOV can help refine that evidence so the narrative reflects the employer's actual model, not a generic corporate strategy statement."
            ),
            ("cmo", "healthcare-social-care"): (
                "A healthcare or social care marketing example should explain the audience, service line, community or patient flow, and whether the candidate was shaping demand, trust, or care operations. Identify what was under their control versus what depended on clinical or operational teams, and keep the narrative tied to the actual service model. KOV can help prepare a more specific position statement for this sector than a generic brand or marketing story."
            ),
            ("chief-product-officer", "business-support-facilities"): (
                "A product example in business support or facilities often depends on the service model, customer journey, and internal operations. Show how the candidate prioritized user or client needs, where technical or operational partners influenced execution, and how the decision fits the service's actual risk and delivery model. KOV can help turn that into a tighter product narrative that differs from an information-systems story for the same sector."
            ),
            ("cfo", "public-sector-government"): (
                "A public-sector or government finance example should explain the governing context, budget authority, policy constraints, and reporting lines rather than assuming a private-sector financial model. Describe the candidate's own responsibility clearly and show how broader political or administrative stakeholders shaped the decisions. KOV can help keep the narrative specific to public accountability and avoid implying the same commercial discipline as a private company."
            ),
            ("chro", "public-sector-government"): (
                "A human-resources example in public sector or government should distinguish workforce planning, policy constraints, employee relations, and service continuity from private-sector talent strategy. Explain the decision the candidate helped shape, the stakeholder mix, and the limits of their mandate in a public accountability context. KOV can help frame that many public-sector conversations rely on policy, governance, and service continuity rather than commercial growth metrics alone."
            ),
            ("cmo", "holding-companies"): (
                "A holding-company marketing example should explain whether the candidate was shaping group-level brand architecture, operating-company coordination, or a specific business line. Distinguish group governance and central decision-making from local market execution, and keep the role boundaries clear. KOV can help define the narrative so it reflects portfolio complexity rather than a generic corporate brand story."
            ),
            ("coo", "holding-companies"): (
                "For a group operating remit, the best example usually describes how the candidate managed portfolio complexity, business-unit interfaces, or shared services across companies. Show the operational decision, the stakeholder mix, and where accountability sat for each entity, rather than implying one model for the whole organization. KOV can help structure that narrative around domain-specific operating logic and the candidate's actual authority."
            ),
            ("head-business-development", "healthcare-social-care"): (
                "A healthcare or social-care business-development example should tie the candidate's work to the service pipeline, partners, community needs, or operating model of the relevant employer. Explain what relationship or market decision they influenced, what constraints applied, and how the work connected to service access or delivery. KOV can help make this example more specific than a generic growth or outreach story."
            ),
            ("chair", "consulting-professional-services"): (
                "A chair or board example in consulting is usually strongest when it distinguishes governance, practice oversight, client relationship stewardship, and partner accountability. Show which decisions were collective and which were within the candidate's remit, and make the story specific to a firm model or client mix rather than a generic advisory narrative. KOV can help translate that distinction into a concise, credible board narrative."
            ),
            ("coo", "consulting-professional-services"): (
                "A COO example in consulting should explain how the candidate handled delivery quality, partner coordination, staffing, or operating model design. Clarify which decisions sat with the candidate and which depended on client teams, practice leaders, or shared governance. KOV can help turn that into a distinct operating narrative rather than a general leadership story."
            ),
            ("managing-director", "hospitality-food-service"): (
                "A managing director example in hospitality or food service often needs a sharper explanation of service model, customer experience, operational discipline, and owner or investor expectations. State the business challenge, the decision the candidate made, and where responsibility sat across leadership, operations, and partner groups. KOV can help keep the example rooted in the actual industry context rather than a generic management story."
            ),
            ("partner", "hospitality-food-service"): (
                "A partner example in hospitality or food service often centres on commercial relationship management, strategic direction, or investment decisions, not simple line management. Show the candidate's role in shaping the account, partners, or operating priorities, and separate that contribution from operational execution. KOV can help make the evidence specific to a partner-style mandate in this sector."
            ),
            ("chief-revenue-officer", "public-sector-government"): (
                "A revenue or commercial example in government or public-sector settings should reflect regulated purchasing, policy-informed priorities, and service demands rather than private-sector sales logic. Explain how the candidate handled demand, stakeholder alignment, or market-facing work within constraints and what decisions were actually theirs. KOV can help prepare a specific, credible narrative that does not confuse public-sector scrutiny with commercial growth metrics."
            ),
            ("chro", "real-estate-leasing"): (
                "In real-estate or leasing contexts, a people example often needs to show the relationship between property operations, customer service, compliance, and workforce continuity. Explain the decision the candidate shaped, the stakeholders involved, and how the work differed from a purely corporate HR model. KOV can help prepare a distinct people narrative that reflects property or asset-intensive operations."
            ),
            ("partner", "real-estate-leasing"): (
                "A partner example in real-estate or leasing is more convincing when it distinguishes commercial negotiation, portfolio strategy, relationship management, and governance from day-to-day property operations. Explain the candidate's influence on a transaction or portfolio decision and the stakeholder mix involved. KOV can help translate that into a credible partner narrative specific to property or asset management contexts."
            ),
            ("vp-sales", "manufacturing"): (
                "A sales example in manufacturing is often clearer when it distinguishes product mix, channel management, customer buying cycles, and operational delivery constraints. Explain the candidate's commercial remit, customer or distributor relationships, and how production or operational constraints affected the deal or plan. KOV can help turn that into a precise sales story rather than a generic revenue narrative."
            ),
            ("vp-strategy", "manufacturing"): (
                "A strategy example in manufacturing should connect business priorities to production, supply continuity, capacity, or portfolio choices rather than broad corporate strategy language. Clarify which decisions sat with the candidate, how operations and finance informed the recommendation, and what constraints mattered. KOV can help sharpen that narrative for a manufacturing context and avoid repeating the same general strategic claim."
            ),
            ("cfo", "construction-engineering"): (
                "A finance example in construction and engineering needs a clear explanation of project risk, contract structure, capital deployment, and the working relationship with project or site leaders. Distinguish the candidate's financial decision from operational execution and avoid a generic corporate finance story. KOV can help prepare a more precise example that reflects project-based delivery, sequencing, and commercial risk."
            ),
            ("cio", "construction-engineering"): (
                "An information-systems example in construction and engineering often needs a different framing from general corporate technology, because project delivery, site access, procurement, and operational data all shape the work. Explain the system or platform decision, the users involved, and the candidate's role in governance or adoption. KOV can help make that story distinct from a pure finance or project-delivery narrative."
            ),
            ("vp-finance", "consulting-professional-services"): (
                "A finance example in consulting should show how the candidate handled growth, capacity, margin, partner economics, or service-cost pressure within a professional-services model. Explain what decisions were within the candidate's remit and how client delivery or partner expectations shaped the work. KOV can help make that example specific to consulting revenue and operating discipline."
            ),
            ("partner", "consulting-professional-services"): (
                "A partner example in consulting often needs to distinguish client relationship strength, practice development, and commercial leadership from delivery management. Explain the candidate's role in account strategy, partner decision-making, or growth initiatives and show how that differed from a general leadership assignment. KOV can help sharpen the narrative so it clearly belongs in a consulting context."
            ),
            ("cto", "public-sector-government"): (
                "A technology example in the public sector should show how policy, service continuity, procurement, public accountability, and shared operational constraints informed the candidate's work. Explain the system decision, user context, and governance process without conflating it with a commercial product or SaaS story. KOV can help keep the narrative grounded in public-service operating realities."
            ),
            ("director-marketing", "consulting-professional-services"): (
                "A marketing example in consulting or professional services usually depends on service credibility, client trust, and practice differentiation, not mass-market campaigns. Explain which buyers or segments the candidate addressed, what decision they influenced, and how the brand message connected to the firm's specialist offering. KOV can help produce a sharper, more sector-specific story for this context."
            ),
            ("head-growth", "consulting-professional-services"): (
                "A growth example in consulting should distinguish pipeline development, client acquisition, and firm capability from internal delivery or practice management. Clarify what the candidate influenced, who held authority, and how growth decisions connected to service quality or partner alignment. KOV can help frame the narrative around professional-services growth, not generic sales behavior."
            ),
            ("ceo", "manufacturing"): (
                "A manufacturing leadership example should show how the candidate connected operational performance, capital choices, workforce capability, and product-market fit. Explain what they owned at the group level and what depended on plant, supply, or operations leaders. KOV can help shape a CEO-style example that is distinct from a COO narrative in the same sector."
            ),
            ("coo", "manufacturing"): (
                "A manufacturing COO example usually needs a sharper account of production, quality, site operations, and supply continuity than a generic operational leadership story. Describe the candidate's decision rights, the operational trade-offs, and the stakeholder mix across functions. KOV can help ensure the narrative reflects the actual operating model rather than repeating a broad leadership claim."
            ),
            ("chief-strategy-officer", "holding-companies"): (
                "A strategy candidacy in a holding-company context is strongest when it distinguishes group-level portfolio choices, operating-company strategy, and central governance. Explain what the candidate shaped versus what was decided elsewhere, and make the example specific to a group structure rather than a generic corporate strategy case. KOV can help sharpen that distinction for the target."
            ),
            ("cto", "holding-companies"): (
                "A CTO example in a holding-company context often needs to distinguish shared platforms, subsidiary systems, and central technology governance. Clarify what decision rights the candidate held across entities and how the architecture or digital agenda supported each business. KOV can help keep that example distinct from a general technology or strategy narrative."
            ),
            ("chief-product-officer", "healthcare-social-care"): (
                "A product example in healthcare or social care should reflect care pathways, service users, operational constraints, and stakeholder complexity instead of generic product-growth language. Explain what the candidate prioritized, where service or clinical partners influenced the outcome, and how the product decision fit the care model. KOV can help sharpen that narrative without implying that a technology product story is the same as a healthcare delivery one."
            ),
            ("ciso", "healthcare-social-care"): (
                "A security example in healthcare or social care should show how the candidate balanced privacy, operational continuity, workforce access, and regulated obligations. Clarify the decision, the stakeholders involved, and what confidentiality or governance boundaries applied. KOV can help prepare a very different example from a product or strategy story in the same sector."
            ),
            ("non-executive-director", "public-sector-government"): (
                "A non-executive example in public-sector or government work should emphasize governance, accountability, service outcomes, and policy constraints rather than private-market performance. Make the distinction between oversight and operational leadership explicit, and describe the candidate's influence within a collective decision process. KOV can help build a board-style narrative that reflects public governance rather than a generic corporate-director story."
            ),
            ("partner", "public-sector-government"): (
                "A partner example in public-sector or government work usually needs a more precise explanation of policy, procurement, stakeholder management, and public accountability than a private-sector commercial story. Show what the candidate provided and what sat with public bodies or ministers, while keeping the narrative factual and appropriately bounded. KOV can help sharpen the example so it reflects the distinct decision process of a public or quasi-public context."
            )
        }
        if sid == "context" and (r["slug"], ind["slug"]) in specific_context:
            sec["paragraphs"].append(specific_context[(r["slug"], ind["slug"])])
        focused_examples = {
            ("vp-engineering", "manufacturing"): (
                "A useful preparation exercise is to choose a real example involving an engineering-to-production "
                "handoff. Identify the design choice, the operational constraint, and how quality or delivery "
                "colleagues influenced the decision; do not invent a performance result. KOV can help edit the "
                "example into a portfolio note or interview story, confirm that the candidate's part is clear, "
                "and remove product or facility information that is not public."
            ),
            ("vp-engineering", "transportation-logistics"): (
                "A role-specific example could examine a technical change that supported route, dispatch, asset, "
                "or shipment coordination, if that matches the candidate's experience. Explain the operational "
                "users, service constraint, and technical decision separately, so a product or platform outcome "
                "is not confused with the performance of the whole network. KOV can help shape this account for "
                "the resume and interview preparation while protecting commercially sensitive details."
            ),
            ("chief-revenue-officer", "technology-media-telecom"): (
                "For career materials, separate commercial leadership from product ownership: explain the "
                "customer segment, channel, offer, and sales or partnership decisions that sat within the "
                "candidate's remit. Where several teams influenced adoption or revenue, state the candidate's "
                "part rather than claiming the full result. KOV can build that distinction into a leadership "
                "profile and prepare a concise example for an agreed conversation."
            ),
            ("cio", "technology-media-telecom"): (
                "A CIO case should make clear whether the work concerned enterprise systems, internal service "
                "delivery, data coordination, or technology transformation. Name the users and decision partners, "
                "then explain the candidate's role in setting priorities or coordinating implementation. That "
                "keeps the account distinct from a product-launch or engineering-delivery story. KOV can help "
                "position the material for the target and prepare questions about the employer's actual scope."
            ),
        }
        if sid == "evaluation" and (r["slug"], ind["slug"]) in focused_examples:
            sec["paragraphs"].append(focused_examples[(r["slug"], ind["slug"])])
        if sid == "documents":
            sec["sample"] = {
                "heading": f"How we sharpen a {r['name']} summary for {ind['name']}",
                "before": "Senior professional with a broad record of leading teams and delivering change.",
                "after": f"{r['name']} with a clear remit to {r['remit']}, supported by examples of {ind['evidence']}.",
            }
            sec["table"] = {
                "headers": ["Document", "Emphasis for this target", "Review before sharing"],
                "rows": [
                    ["Resume or CV", f"{r['evidence']} in the context of {ind['model']}.", "Check facts, attribution, dates, and confidentiality."],
                    ["Professional biography", f"Summarize the {r['name']} remit and relevance to {ind['name']}.", "Confirm audience and level of detail."],
                    ["Career evidence brief", f"Choose examples that demonstrate {ind['evidence']}.", "Use authorized information only."],
                    ["Online profile", "Keep public role positioning coherent with your target.", "Review visibility and public disclosures."],
                ],
            }
        if sid == "service-scope":
            sec["cards"] = [
                {"title": "Private career representation", "text": f"Discuss how agreed research and positioning could support a {r['name']} search connected with {ind['name']}, including approvals for any outreach.", "href": "/services.html", "linkText": "Explore representation"},
                {"title": "Individual career services", "text": f"Consider document and positioning support for {r['name']} materials that present {r['evidence']} in a way relevant to {ind['model']}.", "href": "/candidate-services.html", "linkText": "Explore individual services"},
            ]
        if sid == "mistakes":
            sec["bullets"] = [
                f"Treat {ind['name']} as one uniform employer type; distinguish the actual organization and role.",
                f"Use a {r['name']} title without explaining {r['remit']}.",
                f"Present {ind['evidence']} without clarifying personal contribution or context.",
                "Assume a specific recruiter, board, or hiring route without confirming it for the opportunity.",
                "Disclose restricted information to demonstrate credibility; use an authorized summary instead.",
            ]
        if sid == "markets":
            sec["tabs"] = [
                {"name": market, "text": f"{market}: assess how {r['remit']} relates to {ind['model']}; confirm local role questions and agree any outreach before contact."}
                for market, _ in MARKETS
            ]
            sec["cards"] = [
                {"title": "Dubai market guidance", "text": f"Consider whether Dubai fits this {r['name']} target in {ind['name']}; compare the proposed work with {r['remit']} before discussing approved next steps.", "href": "/markets/executive-job-search-dubai.html", "linkText": "Dubai search support"},
                {"title": "United Kingdom market guidance", "text": f"Use KOV's London page to start a discussion of {r['name']} opportunities connected with {ind['name']}, then verify the role's location and scope.", "href": "/markets/executive-job-search-london.html", "linkText": "London search support"},
            ]
        sections.append(sec)
    related_roles = [x for x in roles if x["slug"] != r["slug"] and ind["slug"] in [a["slug"] for a in pair_industries(x)]][:1]
    if len(related_roles) < 2:
        related_roles += [x for x in roles if x["slug"] != r["slug"] and x not in related_roles][:2-len(related_roles)]
    available_industry_slugs = {x["slug"] for x in pair_industries(r)}
    related_inds = [
        x for x in INDUSTRIES
        if x["slug"] != ind["slug"] and x["slug"] in available_industry_slugs
    ][:1]
    sections.append({
        "id": f"{r['slug']}-{ind['slug']}-related",
        "heading": "Related role and industry guides",
        "paragraphs": [
            f"Compare {r['remit']} with the operating context of {ind['name']} ({ind['model']}); the separate hub pages add detail about each side of that decision.",
            f"Adjacent functions may share stakeholders, but the candidate should test each remit against {ind['evidence']} and their own evidence before selecting a target.",
        ],
        "cards": [
            {"title": f"{r['name']} career hub", "text": f"Review the role-wide approach to {r['remit']} and the evidence expected for that scope.", "href": f"/roles/{r['slug']}/", "linkText": f"Return to {r['name']} hub"},
            {"title": f"{ind['name']} industry hub", "text": f"Compare how {ind['model']} affects career planning across functions.", "href": f"/industries/{ind['slug']}/", "linkText": f"Explore {ind['name']}"},
            *[{"title": f"{x['name']} in {ind['name']}", "text": f"Contrast {x['remit']} with the {r['name']} remit; consider where each function meets {ind['model']}.", "href": f"/roles/{x['slug']}/{ind['slug']}.html", "linkText": f"Explore {x['name']}"} for x in related_roles],
            *[{"title": f"{r['name']} in {x['name']}", "text": f"Compare {x['model']} with {ind['model']} and identify how the {r['name']} remit changes.", "href": f"/roles/{r['slug']}/{x['slug']}.html", "linkText": f"Explore {x['name']}"} for x in related_inds],
        ],
    })
    faq_questions = [
        [
            f"What should a {r['name']} clarify before considering work in {ind['name']}?",
            f"Which questions should a {r['name']} resolve before a target discussion in {ind['name']}?",
            f"What belongs on the first-discussion agenda for a {r['name']} in {ind['name']}?",
            f"How can a {r['name']} test the scope of work in {ind['name']}?",
        ],
        [
            f"What evidence can a {r['name']} use to explain experience in {ind['name']}?",
            f"How should a {r['name']} describe transferable experience for {ind['name']} work?",
            f"Which parts of a {r['name']} career story fit the needs of {ind['name']}?",
            f"How can a {r['name']} make prior work relevant to {ind['name']}?",
        ],
        [
            f"Which career materials can help a {r['name']} explore work in {ind['name']}?",
            f"What documents should a {r['name']} tailor for {ind['name']} opportunities?",
            f"How can a {r['name']} choose documents for conversations about {ind['name']}?",
            f"What should a {r['name']} prepare in writing before targeting {ind['name']}?",
        ],
        [
            f"What should a {r['name']} approve before outreach in {ind['name']}?",
            f"What must be agreed before a {r['name']} contacts an organization in {ind['name']}?",
            f"Which outreach choices belong to a {r['name']} considering {ind['name']}?",
            f"How can KOV and a {r['name']} plan contact with {ind['name']} organizations?",
        ],
        [
            f"How can a {r['name']} assess fit with {ind['name']} responsibilities?",
            f"How should a {r['name']} compare title and remit in {ind['name']}?",
            f"What makes a {r['name']} background relevant to work in {ind['name']}?",
            f"Can a {r['name']} rely on title alone when targeting {ind['name']}?",
        ],
        [
            f"What outcome can KOV guarantee for a {r['name']} seeking work in {ind['name']}?",
            f"What can KOV promise a {r['name']} candidate considering {ind['name']}?",
            f"Will KOV secure a meeting for a {r['name']} with an employer in {ind['name']}?",
            f"Does KOV control employer responses to {r['name']} outreach in {ind['name']}?",
        ],
    ]
    faq_answers = [
        [
            f"Start with the organization's account of {ind['model']}, then clarify how the {r['name']} would {r['remit']}. Ask how {ind['stakeholders']} participate, which decisions are assigned to the role, and what evidence the employer wants to discuss. Record unanswered questions about location and working conditions before deciding whether to proceed.",
            f"Use the opening discussion to understand the specific {ind['name']} employer, not to assume a standard role. Compare {r['remit']} with the stated scope, identify decision partners among {ind['stakeholders']}, and ask what outcomes the candidate would be expected to influence. KOV can help organize this preparation within an agreed service.",
            f"A {r['name']} candidate can test whether the opportunity fits by asking about authority, reporting, priorities, and the organization's {ind['model']}. Explore how the role will {r['remit']} and what experience is considered relevant. A clear brief helps the candidate compare the position with personal goals and constraints.",
        ],
        [
            f"Select examples that show {r['evidence']} and relate them to the particular employer's {ind['evidence']}. Explain the situation, the candidate's contribution, and what others did; then state why the experience transfers to {ind['name']} without claiming every organization operates alike.",
            f"Make the connection explicit: the candidate's record of {r['evidence']} should illuminate work the employer describes, including {ind['evidence']}. Separate direct experience from transferable capability and use an example whose facts, attribution, and disclosure are all supportable.",
            f"Describe an instance where the candidate could {r['remit']}; connect its decisions and learning to {ind['model']}. The account should explain what the candidate owned, how {ind['stakeholders']} were involved, and why the example is pertinent to this role rather than a generic sector claim.",
        ],
        [
            f"Possible materials include {r['documents']}. Choose the resume, biography, or supporting example that best explains the candidate's scope and relevance to {ind['evidence']}. Each claim should be accurate for this {ind['name']} target, and confidential or unauthorized material should be omitted.",
            f"Begin with the candidate's accurate career record, then decide whether a resume, biography, or selected evidence is most useful for the audience. For a {r['name']}, clarify the remit and connect it with {ind['evidence']}; do not disclose protected details to make an example seem stronger.",
            f"Document selection depends on the opportunity. A {r['name']} may draw from {r['documents']}, but should foreground only material connected to {ind['evidence']}. Keep the account consistent across versions and adjust emphasis without changing facts.",
        ],
        [
            f"First define the target and recipient, then agree the message and what may be disclosed. KOV can discuss research or outreach where included in the {r['name']} candidate's service scope; the candidate approves external communication. No one route should be assumed for all {ind['name']} employers.",
            f"Outreach should follow target research, not precede it. The {r['name']} candidate and KOV can agree whether contact is suitable, who may receive it, and how the candidate's experience with {r['evidence']} is presented. The candidate retains approval of any external message.",
            f"Consider the specific organization, the candidate's preferences, and the agreed scope before contact. KOV does not assume a standard {ind['name']} route; research, message, recipient, and disclosure boundaries should be settled with the {r['name']} candidate first.",
        ],
        [
            f"No. Compare the role description with the candidate's experience of {r['remit']} and the organization's {ind['model']}. A familiar title may cover a different mandate, so confirm authority, stakeholders, and expected contribution before judging whether the experience fits.",
            f"Title is only a label. Establish what the employer means by {r['name']} in this {ind['name']} organization and how the person will work with {ind['stakeholders']}. Then assess the candidate's evidence against the actual responsibilities and decision boundaries.",
            f"A title cannot demonstrate fit by itself. The candidate should relate {r['evidence']} to the employer's stated needs, clarify how {ind['model']} shapes the work, and distinguish prior direct responsibility from capabilities that could transfer.",
        ],
        [
            f"No. KOV can discuss agreed research, positioning, and approved outreach for a {r['name']} candidate considering {ind['name']}, but cannot promise a meeting or introduction. The employer decides whether to respond or hire, and the candidate authorizes any external communication.",
            f"KOV does not guarantee introductions, interviews, offers, or employment for a {r['name']} search. Service activity can be agreed with the candidate, but the availability of a contact and any employer response are outside KOV's control.",
            f"No specific {ind['name']} introduction can be promised. KOV's role is to support the candidate within an agreed service scope; employers control their decisions and the candidate retains approval of any outreach.",
        ],
    ]
    faq_seed = zlib.crc32(f"{r['slug']}:{ind['slug']}".encode())
    faqs = [
        {
            "question": faq_questions[index][(faq_seed + index) % len(faq_questions[index])],
            "answer": faq_answers[index][(faq_seed // (index + 2) + index) % len(faq_answers[index])],
        }
        for index in range(len(faq_questions))
    ]
    pair = {
        "outputHtml": f"roles/{r['slug']}/{ind['slug']}.html",
        "outputMarkdown": f"ai/roles/{r['slug']}-{ind['slug']}.md",
        "canonical": f"/roles/{r['slug']}/{ind['slug']}.html",
        "title": f"{r['name']} Career Representation in {ind['name']} | KOV",
        "heading": f"{r['name']} career representation in {ind['name']}",
        "eyebrow": f"{r['group']} × {ind['name']}",
        "description": f"Explore how KOV supports {r['name']} candidates considering {ind['name']}: role positioning, career documents, target research, approved outreach, and next steps.",
        "answer": answer,
        "reviewedOn": REVIEWED,
        "serviceName": f"{r['name']} career representation for {ind['name']}",
        "serviceType": "Candidate-side career representation and individual career services",
        "breadcrumbs": [{"name": "Home", "url": "/"}, {"name": f"{r['name']} career hub", "url": f"/roles/{r['slug']}/"}],
        "sourceFacts": [],
        "sourceNotes": source_notes(r, ind),
        "sections": sections,
        "faqs": faqs,
    }
    return pair


def pair_industries(r: dict) -> list[dict]:
    if r["industries"] is None or r["slug"] in {"ceo","coo","cfo","cto","cio","cmo","chro","ciso","general-counsel","chief-revenue-officer","chief-product-officer","chief-strategy-officer","board-director","non-executive-director","chair","managing-director","managing-partner","partner"}:
        return INDUSTRIES
    allowed = set(r["industries"])
    return [x for x in INDUSTRIES if x["slug"] in allowed]


def source_notes(r: dict | None = None, ind: dict | None = None) -> list[dict]:
    notes = [
        {"title":"KOV Career Agency — Private Career Representation","url":"https://www.kovcareeragency.org/services.html","checkedOn":REVIEWED,"verification":"Opened the public service page and verified the service stages and candidate-side boundaries used in this page."},
        {"title":"KOV Career Agency — Individual Career Services","url":"https://www.kovcareeragency.org/candidate-services.html","checkedOn":REVIEWED,"verification":"Opened the public service page and verified the individual-service categories referenced in this page."},
    ]
    if r:
        notes.append({"title":"Internal source — SOC 2018 definitions workbook","url":"data/taxonomy/soc_2018_definitions.xlsx","checkedOn":REVIEWED,"verification":f"Opened the local SOC reference workbook and used it only as occupation taxonomy context for {r['name']}; role-specific hiring or legal claims are not inferred from the taxonomy."})
    if ind:
        notes.append({"title":"Internal source — 2022 NAICS structure workbook","url":"data/taxonomy/2022_NAICS_Structure.xlsx","checkedOn":REVIEWED,"verification":f"Opened the local NAICS reference workbook and used it only as internal industry taxonomy context for {ind['name']}; no sector-specific hiring statistic or regulation is claimed."})
    return notes


def role_record(r: dict, roles: list[dict]) -> dict:
    sections = role_hub_sections(r, roles)
    role_groups = {
        "C-suite": "senior enterprise leadership",
        "Board and ownership": "governance, ownership, and organizational leadership",
        "VP level": "functional executive leadership",
        "Director level": "functional and operational leadership",
        "Heads of function": "specialist function leadership",
    }
    return {
        "outputHtml":f"roles/{r['slug']}/index.html",
        "outputMarkdown":f"ai/roles/{r['slug']}.md",
        "canonical":f"/roles/{r['slug']}/",
        "title":f"{r['name']} Career Representation | KOV Career Agency",
        "heading":f"Career representation for {r['name']} professionals",
        "eyebrow":f"{r['group']} career strategy",
        "description":f"A practical guide to {r['name']} career positioning, professional documents, target research, and candidate-side career representation with KOV.",
        "answer":f"KOV helps {r['name']} professionals clarify a next-role strategy, present relevant experience, and coordinate agreed research and professional outreach. Work begins with discussion of goals, fit, and scope. The candidate retains career decisions; employers make hiring decisions.",
        "reviewedOn":REVIEWED,
        "serviceName":f"{r['name']} career representation and positioning",
        "serviceType":"Candidate-side career representation and individual career services",
        "breadcrumbs":[{"name":"Home","url":"/"},{"name":"Roles","url":"/roles/"}],
        "sourceFacts":[],
        "sourceNotes":source_notes(r),
        "sections":sections,
        "faqs":hub_faqs(r),
    }


def industry_hub_paragraph(ind: dict, heading: str, index: int) -> str:
    name = ind["name"]
    model = ind["model"]
    tension = ind["tension"]
    evidence = ind["evidence"]
    stakeholders = ind["stakeholders"]
    questions = ind["questions"]
    patterns = [
        f"{name} employers can differ in how they organize {model}. While reading a role description, compare its named responsibilities with the candidate's experience of {evidence}; then ask how those duties connect to {tension}. This keeps a sector label from standing in for an employer's actual mandate.",
        f"Use {heading.lower()} to examine the particular organization, not an assumed industry template. In {name}, {stakeholders} may have different relationships from one employer to another. A candidate can ask how {model} is defined, who owns the relevant decisions, and what evidence of {evidence} is appropriate to discuss.",
        f"For a {name} target, turn {questions} into practical research prompts. Establish which points are already clear from the employer's own description and which require a direct question. KOV can help organize the candidate's agreed priorities and prepare materials that connect {evidence} with the role under consideration.",
        f"The title alone will not explain a {name} opportunity. Look for how {tension} is reflected in the responsibilities, relationships, and stated purpose of the role. Candidates can then decide whether their background in {evidence} is relevant, and describe their contribution without claiming authority held by {stakeholders}.",
        f"When considering {model}, ask what the phrase means at this {name} organization rather than assuming a standard arrangement. The answer may shape {heading.lower()}, especially where {tension} affects collaboration. A careful account links the candidate's own work to {evidence} and distinguishes it from the contribution of others.",
        f"A useful {name} conversation starts with the employer's stated work and moves to {questions}. Explore how {stakeholders} participate, what the role can decide, and where it relies on others. This gives the candidate a grounded way to relate {evidence} to the opportunity without making unsupported assumptions about the organization.",
        f"Candidates comparing {name} employers should separate the sector's broad description from the operating details of a specific organization. Clarify {model}, then test how {tension} appears in the position's remit. KOV can help select relevant examples of {evidence} and shape them for the agreed audience.",
        f"Across {name}, the same professional title may sit in different structures. Ask how {stakeholders} interact with the role and whether {model} accurately describes the employer. For {heading.lower()}, use examples that show the candidate's own decisions around {evidence}, with the context needed to interpret them.",
        f"Before pursuing a {name} position, the candidate can compare its stated remit with their experience of {evidence}. Questions about {tension} and {questions} help reveal what the employer expects, while attention to {stakeholders} can clarify reporting, advice, and delivery relationships without presuming they are identical.",
        f"Build a {name} target profile from information about the organization itself: its described work, {model}, and the role's connection to {tension}. Then choose candidate examples of {evidence} that can be shared appropriately. This is more useful than relying on a generic description of what seniority means.",
    ]
    return patterns[index % len(patterns)]


def industry_hub_record(ind: dict, roles: list[dict]) -> dict:
    present = [r for r in roles if ind in pair_industries(r)]
    headings = [
        "Understand the organization before choosing a target",
        "How KOV works across roles in this industry",
        "Clarify the decision-makers for the specific opportunity",
        "Research the mandate and the people it serves",
        "Documents that connect experience to the work",
        "Plan considered professional outreach",
        "Prepare for evaluation without assuming one process",
        "Common industry-positioning mistakes and corrections",
        "How KOV runs a search in each market",
        "Choose an appropriate level of career support",
    ]
    sections = []
    for ix, heading in enumerate(headings):
        sec={"id":f"{ind['slug']}-section-{ix+1}","heading":heading,
             "paragraphs":[industry_hub_paragraph(ind,heading,ix * 2 + offset) for offset in range(2)]}
        if ix==2:
            sec["table"]={"headers":["Stakeholder group","What to establish","Candidate preparation"],
                "rows":[
                    ["Owners, board, or governing group",f"How the organization describes {ind['model']} and its role authority","Ask who appoints, supervises, or advises the role."],
                    ["Executives and function leaders",f"How {ind['tension']} affects the mandate","Clarify reporting, partnership, and decision boundaries."],
                    ["Customers, members, or service users",f"Which relationships matter in {ind['name']}","Use relevant, authorized evidence of service understanding."],
                    ["External partners and oversight stakeholders",f"Which requirements apply to this specific employer and location","Confirm details rather than infer them from sector labels."],
                ]}
        if ix==4:
            sec["sample"]={"heading":f"How we clarify a leadership summary for {ind['name']}",
                "before":"Senior leader with experience managing complex organizations.",
                "after":f"Senior leader who connects team decisions and service priorities within {ind['model']}, with examples grounded in {ind['evidence']}."}
        if ix==7:
            sec["bullets"]=[
                f"Treat {ind['name']} as a single employer model; research each organization's services and structure.",
                f"Use sector language without explaining your own role in {ind['evidence']}.",
                "Assume a board, owner, recruiter, or regulator has the same role at every organization.",
                "Rely on a title to prove fit rather than comparing the actual responsibilities.",
                "Share confidential client, employee, or business information to make a point.",
            ]
        if ix==8:
            sec["tabs"]=[
                {"name":m,"text":f"For {ind['name']} targets in {m}, KOV's search planning starts by naming the role and location, checking the employer's stated context, and agreeing research, documents, disclosure boundaries, and approved outreach. Review the relevant existing KOV market page and verify local requirements with current qualified sources."}
                for m,_ in MARKETS
            ]
            sec["cards"]=[
                {"title":"Dubai executive search","text":"Review KOV's market page and discuss whether Dubai fits the target role and location.", "href":"/markets/executive-job-search-dubai.html","linkText":"Dubai support"},
                {"title":"United Kingdom executive search","text":"Use KOV's London page as a starting point for an agreed UK-focused search discussion.", "href":"/markets/executive-job-search-london.html","linkText":"London support"},
            ]
        if ix==9:
            sec["cards"]=[
                {"title":"Private career representation","text":"Discuss target strategy, research, positioning, approved outreach, and follow-up.", "href":"/services.html","linkText":"Explore representation"},
                {"title":"Individual career services","text":"Explore document, profile, positioning, portfolio, website, and coaching support.", "href":"/candidate-services.html","linkText":"Explore individual services"},
            ]
        sections.append(sec)
    sections.append({
        "id":f"{ind['slug']}-role-cards",
        "heading":f"Role guides for {ind['name']}",
        "paragraphs":[
            f"Different functions meet {ind['name']} through different responsibilities. The role-specific pages consider how each professional can research {ind['model']}, clarify a target mandate, and present evidence that fits the opportunity.",
            "Use the cards to open only the role-and-industry pages currently available. Each page is linked to its role hub, this industry guide, and KOV service information.",
        ],
        "cards":[
            {"title":f"{r['name']} in {ind['name']}","text":f"Explore how {r['remit']} connects with {ind['model']}.","href":f"/roles/{r['slug']}/{ind['slug']}.html","linkText":f"Explore {r['name']}"}
            for r in present
        ],
    })
    sections.append({
        "id": f"{ind['slug']}-industry-brief",
        "heading": f"Questions that make a {ind['name']} target more specific",
        "paragraphs": [
            f"Start by asking what the organization means by {ind['model']}. The industry label does not establish its particular services, ownership, customers, or operating boundaries; clarify those details before deciding whether a role fits.",
            f"Map the relationships among {ind['stakeholders']} for the opportunity under consideration. Separate reporting, consultation, and delivery responsibilities so a candidate can describe collaboration without implying that every stakeholder holds the same authority.",
            f"Use {ind['evidence']} to select examples for a resume, biography, or conversation. A useful account explains the context, the candidate's role, and what can be supported while protecting confidential or identifying information.",
            f"Turn questions about {ind['questions']} into a target-research checklist. Record what is known, what the employer has not yet clarified, and which points need confirmation from a current and appropriate source.",
            f"In this field, {ind['tension']} may help a candidate frame thoughtful questions, but it is not a claim that every organization faces the same priorities. KOV can help connect a candidate's experience to an agreed target and prepare suitable, approved materials.",
        ],
    })
    faqs=[
        {"question":f"What should a senior candidate learn about a {ind['name']} employer first?","answer":f"Confirm the organization’s actual services, stakeholders, operating model, role remit, and decision structure. Do not infer them from the industry label."},
        {"question":f"Which leadership roles have industry guides for {ind['name']}?","answer":f"The guide links to role-and-industry pages currently published for {ind['name']}. Each page addresses a distinct role perspective and links to its role hub."},
        {"question":f"Does an industry guide establish local qualifications for {ind['name']}?","answer":"No. Confirm any qualification, authorization, or other requirement for the exact position and location with the employer or a qualified authority."},
        {"question":f"How does KOV adapt career materials for {ind['name']}?","answer":f"KOV can help candidates organize relevant experience and documents around an agreed target. Candidate materials should accurately describe {ind['evidence']} and protect confidential information."},
        {"question":f"Can KOV promise an interview with a {ind['name']} organization?","answer":"No. KOV does not guarantee interviews, offers, employment, introductions, or timelines. Employers make hiring decisions."},
        {"question":f"How should I compare two {ind['name']} opportunities?","answer":"Compare the actual mandates, stakeholders, work conditions, decision boundaries, and your own priorities. Ask the organization to clarify anything material that is not stated."},
    ]
    return {
        "outputHtml":f"industries/{ind['slug']}/index.html",
        "outputMarkdown":f"ai/industries/{ind['slug']}.md",
        "canonical":f"/industries/{ind['slug']}/",
        "title":f"{ind['name']} Careers and Representation | KOV",
        "heading":f"Career representation across {ind['name']}",
        "eyebrow":f"Industry guide · {ind['name']}",
        "description":f"A guide to candidate-side career positioning, documents, target research, and KOV services for professionals considering {ind['name']}.",
        "answer":f"KOV helps professionals considering {ind['name']} clarify target roles, research organizations, present relevant experience, and agree professional outreach. The industry's {ind['model']} can shape the questions a candidate asks, but each employer and role should be assessed on its own facts.",
        "reviewedOn":REVIEWED,
        "serviceName":f"Career representation for {ind['name']} professionals",
        "serviceType":"Candidate-side career representation and individual career services",
        "breadcrumbs":[{"name":"Home","url":"/"},{"name":"Industries","url":"/industries/"}],
        "sourceFacts":[],
        "sourceNotes":source_notes(None,ind),
        "sections":sections,
        "faqs":faqs,
    }


def record_path(page: dict) -> Path:
    path=page["canonical"].strip("/")
    parts=path.split("/")
    if len(parts)==2 and parts[0]=="roles":
        name=f"{parts[1]}.json"
    elif len(parts)==2 and parts[0]=="industries":
        name=f"industry-{parts[1]}.json"
    elif len(parts)==3 and parts[0]=="roles":
        name=f"pair-{parts[1]}--{parts[2].removesuffix('.html')}.json"
    else:
        raise ValueError(f"Unexpected planned page route: {page['canonical']}")
    return DATA_DIR/name


def update_progress(completed: int, stage: str, next_step: str) -> None:
    log=ROOT/"BUILD-LOG.md"
    text=log.read_text(encoding="utf-8")
    marker="## Resumed full build progress"
    body=text
    while body.startswith("> "):
        body=body.split("\n",1)[1] if "\n" in body else ""
    body=body.lstrip("\n")
    if marker in body:
        body=body.split(marker,1)[0].rstrip()
    marker="## Resumed full build progress"
    note=f"{marker}\n\n- Latest checkpoint: {completed}/612 new planned pages recorded; stage: {stage}.\n- The full build script is idempotent: existing data records are retained and only missing records are written.\n"
    header=f"> Next step: {next_step}\n> Planned pages added: {completed}/612; current stage: {stage}."
    log.write_text(header+"\n\n"+body.rstrip()+"\n\n"+note,encoding="utf-8",newline="\n")


def add_records(pages: list[dict], stage: str, completed_before: int) -> int:
    done=completed_before
    for page in pages:
        path=record_path(page)
        path.parent.mkdir(parents=True,exist_ok=True)
        path.write_text(json.dumps(page,ensure_ascii=False,indent=2)+"\n",encoding="utf-8",newline="\n")
        done+=1
        if done%3==0:
            update_progress(done,stage,f"Continue {stage} generation, then validate the completed phase.")
    update_progress(done,stage,f"Validate {stage}, then continue to the next planned phase.")
    return done


def refresh_overviews(roles: list[dict]) -> None:
    for path, kind, entries in [
        (DATA_DIR/"roles-overview.json","roles",roles),
        (DATA_DIR/"industries-overview.json","industries",INDUSTRIES),
    ]:
        page=json.loads(path.read_text(encoding="utf-8"))
        section=next(s for s in page["sections"] if s.get("cards"))
        if kind=="roles":
            section["cards"]=[{"title":r["name"],"text":f"Explore how KOV supports {r['name']} candidates with target definition, evidence-based positioning, documents, and agreed search activity.","href":f"/roles/{r['slug']}/","linkText":f"Explore {r['name']}"} for r in roles]
        else:
            section["cards"]=[{"title":i["name"],"text":f"Explore candidate-side career planning for organizations shaped by {i['model']}.","href":f"/industries/{i['slug']}/","linkText":f"Explore {i['name']}"} for i in INDUSTRIES]
        path.write_text(json.dumps(page,ensure_ascii=False,indent=2)+"\n",encoding="utf-8",newline="\n")


def refresh_industry_hubs(roles: list[dict], include_legal: bool = True) -> None:
    for ind in INDUSTRIES:
        if ind["slug"] == "legal-services":
            if not include_legal:
                continue
            path=DATA_DIR/"legal-services.json"
        else:
            path=DATA_DIR/f"industry-{ind['slug']}.json"
        if path.exists():
            page=industry_hub_record(ind,roles)
            path.write_text(json.dumps(page,ensure_ascii=False,indent=2)+"\n",encoding="utf-8",newline="\n")


def sync_sitemap_and_llms() -> None:
    paths=[]
    for record in sorted(DATA_DIR.glob("*.json")):
        page=json.loads(record.read_text(encoding="utf-8"))
        canonical=page["canonical"]
        if canonical in {"/roles/","/industries/"} or canonical in {"/roles/ceo/","/roles/ceo/legal-services.html","/industries/legal-services/"}:
            continue
        paths.append((canonical,page["title"],page["description"]))
    sitemap=ROOT/"sitemap.xml"
    xml=sitemap.read_text(encoding="utf-8")
    existing=set(re.findall(r"<loc>(.*?)</loc>",xml))
    entries=[]
    for canonical,_,_ in paths:
        url=BASE_URL+canonical
        if url not in existing:
            entries.append(f"  <url><loc>{url}</loc><lastmod>{REVIEWED}</lastmod></url>")
    if entries:
        xml=xml.replace("</urlset>","\n".join(entries)+"\n</urlset>")
        sitemap.write_text(xml,encoding="utf-8",newline="\n")
    llms_path=ROOT/"llms.txt"
    llms=llms_path.read_text(encoding="utf-8")
    heading="## Role and industry library"
    prefix=llms.split(heading,1)[0].rstrip()
    section=[heading,"","Role hubs, industry hubs, and role-in-industry guides:"]
    for canonical,title,description in paths:
        section.append(f"- [{title}]({BASE_URL}{canonical}): {description}")
    llms_path.write_text(prefix+"\n\n"+"\n".join(section)+"\n",encoding="utf-8",newline="\n")


def run(command: list[str], label: str) -> None:
    print(f"--- {label} ---",flush=True)
    result=subprocess.run(command,cwd=ROOT,text=True)
    if result.returncode:
        raise RuntimeError(f"{label} failed with exit code {result.returncode}")


def validate_phase(stage: str) -> None:
    sync_sitemap_and_llms()
    run([str(PYTHON),"scripts/_render-research-pages.py"],f"Render and rebuild full-text feed after {stage}")
    run([str(PYTHON),"scripts/build-site-search-index.py"],f"Refresh search index after {stage}")
    run([str(PYTHON),"validate_schema.py"],f"Whole-site validation after {stage}")
    run([str(PYTHON),"scripts/check-research-pages.py"],f"Length, FAQ, and overlap check after {stage}")


def main() -> int:
    roles=ROLES
    initial=0
    refresh_industry_hubs(roles, include_legal=False)

    # Phase 1: five legal-focused hubs and their Legal Services pages.
    legal_slugs={"general-counsel","head-legal","managing-partner","partner","managing-director"}
    legal_roles=[r for r in roles if r["slug"] in legal_slugs]
    legal_pages=[]
    for r in legal_roles:
        legal_pages.append(role_record(r,roles))
        legal_pages.append(pair_page(r,next(i for i in INDUSTRIES if i["slug"]=="legal-services"),roles))
    initial=add_records(legal_pages,"Legal Services cluster",initial)
    refresh_overviews(roles)
    validate_phase("Legal Services cluster")

    # Phase 2: remaining role hubs.
    existing_role_slugs={"ceo"}|legal_slugs
    hub_pages=[role_record(r,roles) for r in roles if r["slug"] not in existing_role_slugs]
    initial=add_records(hub_pages,"remaining role hubs",initial)
    refresh_overviews(roles)
    validate_phase("all role hubs")

    # Phase 3: remaining industry hubs.
    remaining_industries=[i for i in INDUSTRIES if i["slug"]!="legal-services"]
    industry_pages=[industry_hub_record(i,roles) for i in remaining_industries]
    initial=add_records(industry_pages,"industry hubs",initial)
    refresh_overviews(roles)
    validate_phase("all industry hubs")

    # Phase 4: all remaining pair pages, in role order and industry order.
    pair_pages=[]
    for r in roles:
        for ind in pair_industries(r):
            canonical=f"/roles/{r['slug']}/{ind['slug']}.html"
            if canonical=="/roles/ceo/legal-services.html":
                continue
            if canonical==f"/roles/{r['slug']}/legal-services.html" and r["slug"] in legal_slugs:
                continue
            pair_pages.append(pair_page(r,ind,roles))
    expected_pairs=548
    if len(pair_pages)!=expected_pairs:
        raise RuntimeError(f"Pair plan generated {len(pair_pages)} pages; expected {expected_pairs}.")
    initial=add_records(pair_pages,"role-by-role industry pages",initial)
    refresh_overviews(roles)
    refresh_industry_hubs(roles)
    validate_phase("all role-industry pages")

    if initial!=612:
        raise RuntimeError(f"Build wrote {initial} records; expected 612.")
    counts={"role":0,"industry":0,"pair":0}
    for record in DATA_DIR.glob("*.json"):
        page=json.loads(record.read_text(encoding="utf-8"))
        parts=page["canonical"].strip("/").split("/")
        if parts[0]=="roles" and len(parts)==2:
            counts["role"]+=1
        elif parts[0]=="industries" and len(parts)==2:
            counts["industry"]+=1
        elif parts[0]=="roles" and len(parts)==3:
            counts["pair"]+=1
    if counts!={"role":40,"industry":21,"pair":554}:
        raise RuntimeError(f"Final page counts incorrect: {counts}")
    print(f"FULL BUILD PASSED: created {initial} planned records across all phases.",flush=True)
    update_progress(initial,"complete","All 612 planned pages are built and validated.")
    return 0


if __name__=="__main__":
    try:
        raise SystemExit(main())
    except Exception as error:
        print(f"BUILD FAILED: {error}",file=sys.stderr)
        raise
