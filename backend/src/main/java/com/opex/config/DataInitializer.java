package com.opex.config;

import com.opex.model.*;
import com.opex.repository.*;
import com.opex.service.UserService;
import com.opex.service.RoleService;
import com.opex.service.StageService;
import com.opex.service.InitiativeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Random;
import java.math.BigDecimal;
import java.util.Optional;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private InitiativeSiteRepository siteRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private RoleService roleService;

    @Autowired
    private StageService stageService;

    @Autowired
    private InitiativeService initiativeService;

    @Autowired
    private WorkflowStepRepository workflowStepRepository;

    @Autowired
    private KPIRepository kpiRepository;

    @Autowired
    private InitiativeDisciplineRepository disciplineRepository;

    @Override
    public void run(String... args) throws Exception {
        // Initialize sites
        initializeSites();
        
        // Initialize disciplines
        initializeDisciplines();
        
        // Initialize roles
        initializeRoles();
        
        // Initialize stages
        initializeStages();
        
        // Initialize users
        initializeUsers();
        
        // Initialize initiatives
        initializeInitiatives();
        
        // Initialize KPIs
        initializeKPIs();
    }

    private void initializeSites() {
        if (siteRepository.count() == 0) {
            List<InitiativeSite> sites = Arrays.asList(
                new InitiativeSite("NDS", "NDS Plant", "Manufacturing"),
                new InitiativeSite("HSD1", "HSD1 Plant", "Manufacturing"),
                new InitiativeSite("HSD2", "HSD2 Plant", "Manufacturing"),
                new InitiativeSite("HSD3", "HSD3 Plant", "Manufacturing"),
                new InitiativeSite("DHJ", "DHJ Plant", "Manufacturing"),
                new InitiativeSite("APL", "APL Plant", "Manufacturing"),
                new InitiativeSite("TCD", "TCD Plant", "Manufacturing")
            );
            siteRepository.saveAll(sites);
            System.out.println("Initialized " + sites.size() + " sites.");
        }
    }

    private void initializeDisciplines() {
        if (disciplineRepository.count() == 0) {
            List<InitiativeDiscipline> disciplines = Arrays.asList(
                new InitiativeDiscipline("MX", "Maintenance", "Maintenance related initiatives for equipment and facility upkeep"),
                new InitiativeDiscipline("PR", "Production", "Production efficiency and process improvement initiatives"),
                new InitiativeDiscipline("QA", "Quality Assurance", "Quality improvement and assurance initiatives"),
                new InitiativeDiscipline("SF", "Safety", "Safety enhancement and risk reduction initiatives"),
                new InitiativeDiscipline("EN", "Energy", "Energy efficiency and conservation initiatives"),
                new InitiativeDiscipline("EV", "Environment", "Environmental protection and sustainability initiatives"),
                new InitiativeDiscipline("IT", "Information Technology", "IT system improvement and digitalization initiatives")
            );
            disciplineRepository.saveAll(disciplines);
            System.out.println("Initialized " + disciplines.size() + " disciplines.");
        }
    }

    private void initializeRoles() {
        if (roleService.findAll().size() == 0) {
            List<InitiativeSite> sites = siteRepository.findAll();
            
            for (InitiativeSite site : sites) {
                // Create roles for each site
                List<Role> siteRoles = Arrays.asList(
                    new Role("STLD", "Site TSD Lead", "Site TSD Lead responsible for initiative registration and process management", site.getCode(), site.getName()),
                    new Role("SH", "Site Head", "Site Head responsible for approvals", site.getCode(), site.getName()),
                    new Role("EH", "Engg Head", "Engineering Head responsible for defining responsibilities and selecting initiative lead", site.getCode(), site.getName()),
                    new Role("IL", "Initiative Lead", "Initiative Lead responsible for MOC, CAPEX and timeline preparation", site.getCode(), site.getName())
                );
                
                for (Role role : siteRoles) {
                    roleService.save(role);
                }
            }
            
            // Create corporate role (CTSD - Corp TSD)
            Role ctsdRole = new Role("CTSD", "Corp TSD", "Corporate TSD responsible for periodic status review", "CORP", "Corporate");
            roleService.save(ctsdRole);
            
            System.out.println("Initialized roles for all sites and corporate.");
        }
    }

    private void initializeStages() {
        if (stageService.findAll().size() == 0) {
            List<Stage> stages = Arrays.asList(
                new Stage(1, "Register initiative", "Site TSD Lead", "STLD", null, "Initial registration of the initiative"),
                new Stage(2, "Approval", "Site Head", "SH", null, "Site head approval of the initiative"),
                new Stage(3, "Define Responsibilities", "Engg Head", "EH", "Annexure 2", "Engineering head defines responsibilities and selects initiative lead"),
                new Stage(4, "MOC Assessment & Process", "Initiative Lead", "IL", null, "Assess MOC requirement and complete MOC process if required"),
                new Stage(5, "CAPEX Assessment & Process", "Initiative Lead", "IL", null, "Assess CAPEX requirement and complete CAPEX process if required")
            );
            
            // Set MOC and CAPEX requirements for specific stages
            stages.get(3).setRequiresMoc(true); // Stage 4 - Combined MOC step
            stages.get(4).setRequiresCapex(true); // Stage 5 - Combined CAPEX step
            
            for (Stage stage : stages) {
                stageService.save(stage);
            }
            
            System.out.println("Initialized " + stages.size() + " workflow stages.");
        }
    }

    private void initializeUsers() {
        if (userService.count() == 0) {
            List<InitiativeSite> sites = siteRepository.findAll();

            // Create users for each site
            for (InitiativeSite site : sites) {
                List<Role> siteRoles = roleService.findBySite(site.getCode());
                
                for (Role role : siteRoles) {
                    String username = site.getCode().toLowerCase() + "_" + role.getCode().toLowerCase();
                    String email = username + "@godeepak.com";
                    
                    User user = new User(
                        username,
                        email,
                        "password123",
                        role.getName().split(" ")[0], // First part as first name
                        role.getName().split(" ")[role.getName().split(" ").length - 1], // Last part as last name
                        role,
                        site.getCode(),
                        site.getName()
                    );
                    userService.save(user);
                }
            }
            
            // Create corporate user (CTSD)
            List<Role> ctsdRoles = roleService.findByCode("CTSD");
            if (!ctsdRoles.isEmpty()) {
                Role ctsdRole = ctsdRoles.get(0);
                User ctsdUser = new User(
                    "corp_ctsd",
                    "corp_ctsd@godeepak.com",
                    "password123",
                    "Corporate",
                    "TSD",
                    ctsdRole,
                    "CORP",
                    "Corporate"
                );
                userService.save(ctsdUser);
            }

            System.out.println("Initialized users for all sites and roles.");
        }
    }

    private void initializeInitiatives() {
        if (initiativeService.findAll().size() == 0) {
            List<InitiativeSite> sites = siteRepository.findAll();
            List<InitiativeDiscipline> disciplines = disciplineRepository.findAll();
            Random random = new Random();

            for (InitiativeSite site : sites) {
                // Create 2-3 initiatives per site
                int initiativeCount = 2 + random.nextInt(2);
                for (int i = 1; i <= initiativeCount; i++) {
                    Initiative initiative = new Initiative();
                    initiative.setTitle("Cost Reduction Initiative " + i + " - " + site.getCode());
                    initiative.setDescription("Initiative to reduce operational costs in " + site.getName());
                    initiative.setCategory("COST_REDUCTION");
                    
                    // Set site and discipline
                    initiative.setSite(site);
                    if (!disciplines.isEmpty()) {
                        initiative.setDiscipline(disciplines.get(random.nextInt(disciplines.size())));
                    }
                    
                    // Find STLD for this site and set as proposer
                    Optional<Role> stldRole = roleService.findByCodeAndSite("STLD", site.getCode());
                    if (stldRole.isPresent()) {
                        initiative.setProposer(site.getCode().toLowerCase() + "_stld@godeepak.com");
                    }
                    
                    initiative.setStatus("PROPOSED");
                    initiative.setPriority("MEDIUM");
                    initiative.setBudgetType("BUDGETED");
                    initiative.setEstimatedSavings(new BigDecimal(100000.0 + random.nextDouble() * 500000.0));
                    initiative.setProposalDate(LocalDate.now().minusDays(random.nextInt(30)));
                    initiative.setExpectedClosureDate(LocalDate.now().plusDays(90 + random.nextInt(180)));
                    
                    // Use InitiativeService.save() instead of repository.save() 
                    // This ensures initiativeId is generated properly
                    try {
                        initiativeService.save(initiative);
                    } catch (Exception e) {
                        System.err.println("Failed to save initiative: " + e.getMessage());
                        e.printStackTrace();
                    }
                }
            }
            System.out.println("Initialized initiatives for all sites.");
        }
    }

    private void initializeKPIs() {
        if (kpiRepository.count() == 0) {
            List<InitiativeSite> sites = siteRepository.findAll();
            Random random = new Random();
            
            String[] kpiNames = {"Total Initiatives", "Completed Initiatives", "Total Savings", "Target Achievement"};
            String[] categories = {"Initiative", "Initiative", "Financial", "Performance"};
            String[] units = {"Count", "Count", "USD", "Percentage"};

            for (InitiativeSite site : sites) {
                // Create monthly KPIs for the past 6 months
                for (int month = 0; month < 6; month++) {
                    LocalDateTime date = LocalDateTime.now().minusMonths(month);
                    
                    for (int i = 0; i < kpiNames.length; i++) {
                        KPI kpi = new KPI();
                        kpi.setName(kpiNames[i]);
                        kpi.setCategory(categories[i]);
                        kpi.setSite(site.getCode());
                        kpi.setMonth(date.getMonth().toString());
                        kpi.setUnit(units[i]);
                        
                        // Set target and actual values based on KPI type
                        if (i == 0) { // Total Initiatives
                            kpi.setTargetValue(new BigDecimal(10));
                            kpi.setActualValue(new BigDecimal(5 + random.nextInt(10)));
                        } else if (i == 1) { // Completed Initiatives
                            kpi.setTargetValue(new BigDecimal(8));
                            kpi.setActualValue(new BigDecimal(2 + random.nextInt(5)));
                        } else if (i == 2) { // Total Savings
                            kpi.setTargetValue(new BigDecimal(100000));
                            kpi.setActualValue(new BigDecimal(50000.0 + random.nextDouble() * 200000.0));
                        } else { // Target Achievement
                            kpi.setTargetValue(new BigDecimal(90));
                            kpi.setActualValue(new BigDecimal(70.0 + random.nextDouble() * 30.0));
                        }
                        
                        kpi.setDescription("Monthly KPI tracking for " + site.getName());
                        kpi.setCreatedAt(date);
                        kpiRepository.save(kpi);
                    }
                }
            }
            System.out.println("Initialized KPIs for all sites.");
        }
    }
}