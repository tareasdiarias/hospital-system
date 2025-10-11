package com.example.hospitalsystem.controller;

import com.example.hospitalsystem.model.Role;
import com.example.hospitalsystem.model.User;
import com.example.hospitalsystem.repository.RoleRepository;
import com.example.hospitalsystem.repository.UserRepository;
import com.example.hospitalsystem.security.JwtService;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    // ⭐ LOGIN CON DNI
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        System.out.println("🔐 Intento de login recibido");
        System.out.println("   - DNI recibido: " + request.getDni());
        System.out.println("   - Password recibida (longitud): " + request.getPassword().length() + " caracteres");

        try {
            // Validar DNI (8 dígitos)
            if (request.getDni() == null || !request.getDni().matches("\\d{8}")) {
                System.out.println("❌ DNI inválido");
                return ResponseEntity.badRequest().body(new ErrorResponse("DNI debe tener 8 dígitos"));
            }

            // Buscar usuario por DNI
            User user = userRepository.findByDni(request.getDni())
                    .orElseThrow(() -> new RuntimeException("DNI no registrado"));

            System.out.println("✅ Usuario encontrado: " + user.getUsername() + " (DNI: " + user.getDni() + ")");

            // Autenticar con username (internamente Spring Security usa username)
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            user.getUsername(),
                            request.getPassword()
                    )
            );

            System.out.println("✅ Autenticación EXITOSA");

            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String token = jwtService.generateToken(userDetails);

            List<String> roles = userDetails.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(LoginResponse.builder()
                    .token(token)
                    .username(user.getUsername())
                    .dni(user.getDni())
                    .email(user.getEmail())
                    .roles(roles)
                    .message("Login exitoso")
                    .build());

        } catch (Exception e) {
            System.out.println("❌ Error en autenticación: " + e.getMessage());
            return ResponseEntity.status(401)
                    .body(new ErrorResponse("DNI o contraseña incorrectos"));
        }
    }

    // ⭐ REGISTRO PÚBLICO (solo DOCTOR y RECEPCIONISTA)
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        System.out.println("📝 Intento de registro - DNI: " + request.getDni() + ", Role: " + request.getRole());

        try {
            // ⭐ VALIDACIÓN 1: DNI debe ser 8 dígitos numéricos
            if (request.getDni() == null || !request.getDni().matches("\\d{8}")) {
                return ResponseEntity.badRequest().body(new ErrorResponse("DNI debe tener exactamente 8 dígitos numéricos"));
            }

            // ⭐ VALIDACIÓN 2: Solo DOCTOR o RECEPCIONISTA
            if (!request.getRole().equalsIgnoreCase("DOCTOR") && !request.getRole().equalsIgnoreCase("RECEPCIONISTA")) {
                return ResponseEntity.badRequest().body(new ErrorResponse("Solo puedes registrarte como Doctor o Recepcionista"));
            }

            // ⭐ VALIDACIÓN 3: DNI no debe estar registrado
            if (userRepository.existsByDni(request.getDni())) {
                return ResponseEntity.badRequest().body(new ErrorResponse("Este DNI ya está registrado"));
            }

            // ⭐ VALIDACIÓN 4: Username no debe estar registrado
            if (userRepository.existsByUsername(request.getUsername())) {
                return ResponseEntity.badRequest().body(new ErrorResponse("Este nombre de usuario ya existe"));
            }

            // ⭐ VALIDACIÓN 5: Email no debe estar registrado
            if (userRepository.existsByEmail(request.getEmail())) {
                return ResponseEntity.badRequest().body(new ErrorResponse("Este email ya está registrado"));
            }

            // ⭐ VALIDACIÓN 6: Validar formato de email
            if (!request.getEmail().matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
                return ResponseEntity.badRequest().body(new ErrorResponse("Email inválido"));
            }

            // ⭐ VALIDACIÓN 7: Contraseña mínimo 6 caracteres
            if (request.getPassword() == null || request.getPassword().length() < 6) {
                return ResponseEntity.badRequest().body(new ErrorResponse("La contraseña debe tener al menos 6 caracteres"));
            }

            // ⭐ Crear nuevo usuario
            User user = new User();
            user.setDni(request.getDni());
            user.setUsername(request.getUsername());
            user.setEmail(request.getEmail());
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            user.setEnabled(true);

            // ⭐ Asignar rol
            String roleName = "ROLE_" + request.getRole().toUpperCase();
            Role role = roleRepository.findByName(roleName)
                    .orElseThrow(() -> new RuntimeException("Rol no encontrado: " + roleName));
            user.getRoles().add(role);

            // ⭐ Guardar usuario
            User savedUser = userRepository.save(user);

            System.out.println("✅ Usuario registrado exitosamente: " + savedUser.getUsername());

            return ResponseEntity.ok(RegisterResponse.builder()
                    .message("Usuario registrado exitosamente")
                    .username(savedUser.getUsername())
                    .dni(savedUser.getDni())
                    .email(savedUser.getEmail())
                    .role(request.getRole())
                    .build());

        } catch (Exception e) {
            System.err.println("❌ Error en registro: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(new ErrorResponse("Error al registrar: " + e.getMessage()));
        }
    }

    // ⭐ VERIFICAR SI UN DNI EXISTE
    @GetMapping("/check-dni/{dni}")
    public ResponseEntity<?> checkDni(@PathVariable String dni) {
        boolean exists = userRepository.existsByDni(dni);
        return ResponseEntity.ok(Map.of("exists", exists));
    }

    // ⭐ VALIDAR TOKEN
    @GetMapping("/validate")
    public ResponseEntity<?> validateToken(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                String username = jwtService.extractUsername(token);
                return ResponseEntity.ok(new MessageResponse("Token válido para: " + username));
            }
            return ResponseEntity.status(401).body(new ErrorResponse("Token inválido"));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(new ErrorResponse("Token inválido: " + e.getMessage()));
        }
    }

    // ⭐ TEST DATABASE
    @GetMapping("/test-db")
    public ResponseEntity<?> testDatabase() {
        try {
            long count = userRepository.count();
            List<String> usernames = userRepository.findAll().stream()
                    .map(User::getUsername)
                    .collect(Collectors.toList());

            System.out.println("✅ TEST DB - Total usuarios: " + count);
            System.out.println("   Usernames: " + usernames);

            return ResponseEntity.ok(Map.of(
                    "totalUsuarios", count,
                    "usernames", usernames,
                    "message", "✅ Conexión a BD exitosa"
            ));
        } catch (Exception e) {
            System.out.println("❌ Error en test-db: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                    "error", "Error al conectar con BD: " + e.getMessage()
            ));
        }
    }

    // ⭐ GENERAR HASH
    @GetMapping("/generate-hash")
    public ResponseEntity<?> generateHash(@RequestParam String password) {
        try {
            BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
            String hash = encoder.encode(password);

            System.out.println("==============================================");
            System.out.println("🔑 GENERANDO HASH PARA CONTRASEÑA");
            System.out.println("   Password: " + password);
            System.out.println("   Hash generado: " + hash);
            System.out.println("==============================================");

            return ResponseEntity.ok(Map.of(
                    "password", password,
                    "hash", hash,
                    "sqlUpdateAdmin", "UPDATE users SET password = '" + hash + "' WHERE username = 'admin';",
                    "message", "✅ Hash generado exitosamente. Usa este SQL para actualizar la contraseña."
            ));
        } catch (Exception e) {
            System.out.println("❌ Error generando hash: " + e.getMessage());
            return ResponseEntity.status(500).body(Map.of(
                    "error", "Error: " + e.getMessage()
            ));
        }
    }

    // ============= DTOs =============

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LoginRequest {
        private String dni;  // ⭐ CAMBIADO de username a dni
        private String password;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LoginResponse {
        private String token;
        private String username;
        private String dni;
        private String email;
        private List<String> roles;
        private String message;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RegisterRequest {
        private String dni;
        private String username;
        private String email;
        private String password;
        private String role; // "DOCTOR" o "RECEPCIONISTA"
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RegisterResponse {
        private String message;
        private String username;
        private String dni;
        private String email;
        private String role;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ErrorResponse {
        private String error;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MessageResponse {
        private String message;
    }
}
