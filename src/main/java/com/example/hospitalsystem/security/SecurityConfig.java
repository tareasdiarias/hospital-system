package com.example.hospitalsystem.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final UserDetailsService userDetailsService;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // ⭐ HABILITAR CORS
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // Deshabilitar CSRF (no necesario para API REST stateless)
                .csrf(csrf -> csrf.disable())

                // Configurar sesiones como STATELESS (usamos JWT)
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // Configurar autorización de requests
                .authorizeHttpRequests(auth -> auth
                        // ⭐ Endpoints públicos
                        .requestMatchers("/error").permitAll()
                        .requestMatchers("/api/auth/**").permitAll()

                        // Resto requiere autenticación
                        .anyRequest().authenticated()
                )

                // Configurar provider de autenticación
                .authenticationProvider(authenticationProvider())

                // Agregar filtro JWT antes del filtro de autenticación
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        System.out.println("✅ SecurityFilterChain configurado con CORS habilitado");

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        System.out.println("🌍 Configurando CORS...");

        CorsConfiguration configuration = new CorsConfiguration();

        // Permitir orígenes del frontend
        configuration.setAllowedOrigins(Arrays.asList(
                "http://localhost:3000",
                "http://localhost:5173"
                "https://*.onrender.com"
        ));

        // Permitir todos los métodos HTTP
        configuration.setAllowedMethods(Arrays.asList(
                "GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"
        ));

        // Permitir todos los headers
        configuration.setAllowedHeaders(Arrays.asList("*"));

        // Permitir credenciales (cookies, authorization headers)
        configuration.setAllowCredentials(true);

        // Exponer header Authorization para que el frontend pueda leerlo
        configuration.setExposedHeaders(Arrays.asList("Authorization"));

        // Aplicar configuración a todas las rutas
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        System.out.println("✅ CORS configurado para: http://localhost:3000 y http://localhost:5173");

        return source;
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
