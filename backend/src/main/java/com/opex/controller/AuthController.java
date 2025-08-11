package com.opex.controller;

import com.opex.config.JwtUtils;
import com.opex.dto.JwtResponse;
import com.opex.dto.LoginRequest;
import com.opex.dto.MessageResponse;
import com.opex.dto.SignupRequest;
import com.opex.model.InitiativeSite;
import com.opex.model.Role;
import com.opex.model.User;
import com.opex.service.InitiativeSiteService;
import com.opex.service.RoleService;
import com.opex.service.UserService;
import javax.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private RoleService roleService;

    @Autowired
    private InitiativeSiteService siteService;

    @Autowired
    private JwtUtils jwtUtils;

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        Optional<User> userOpt = userService.findByEmail(loginRequest.getEmail());
        
        if (userOpt.isPresent() && userService.validatePassword(loginRequest.getPassword(), userOpt.get().getPassword())) {
            User user = userOpt.get();
            String jwt = jwtUtils.generateJwtToken(user.getUsername());
            
            return ResponseEntity.ok(new JwtResponse(jwt,
                    user.getId(),
                    user.getUsername(),
                    user.getEmail(),
                    user.getFullName(),
                    user.getRoleCode(),
                    user.getSiteCode()));
        }
        
        return ResponseEntity.badRequest()
                .body(new MessageResponse("Error: Invalid credentials!"));
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        // Validate email domain
        if (!signUpRequest.getEmail().endsWith("@godeepak.com")) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: Email must be from @godeepak.com domain!"));
        }

        if (userService.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: Email is already in use!"));
        }

        // Generate username from email if not provided
        String username = signUpRequest.getUsername();
        if (username == null || username.trim().isEmpty()) {
            username = signUpRequest.getEmail().split("@")[0];
        }

        if (userService.existsByUsername(username)) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: Username is already taken!"));
        }

        // Get site by ID
        Optional<InitiativeSite> siteOpt = siteService.findById(signUpRequest.getSiteId());
        if (!siteOpt.isPresent()) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: Invalid site selected!"));
        }

        InitiativeSite site = siteOpt.get();

        // Find role by code and site
        Optional<Role> roleOpt = roleService.findByCodeAndSite(signUpRequest.getRoleCode(), site.getCode());
        if (!roleOpt.isPresent()) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: Invalid role selected for this site!"));
        }

        Role role = roleOpt.get();

        User user = new User(
            username,
            signUpRequest.getEmail(),
            signUpRequest.getPassword(),
            signUpRequest.getFirstName(),
            signUpRequest.getLastName(),
            role,
            site.getCode(),
            site.getName()
        );

        userService.save(user);

        return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
    }
}