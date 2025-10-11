package com.example.hospitalsystem.security;

import com.example.hospitalsystem.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        System.out.println("===============================================");
        System.out.println("🔍 Intentando autenticar usuario: " + username);

        com.example.hospitalsystem.model.User user = userRepository.findByUsername(username)
                .orElseThrow(() -> {
                    System.out.println("❌ Usuario NO encontrado en BD: " + username);
                    return new UsernameNotFoundException("Usuario no encontrado: " + username);
                });

        System.out.println("✅ Usuario ENCONTRADO en BD");
        System.out.println("   - Username: " + user.getUsername());
        System.out.println("   - Email: " + user.getEmail());
        System.out.println("   - Enabled: " + user.isEnabled());
        System.out.println("   - Password Hash (primeros 20 chars): " + user.getPassword().substring(0, 20) + "...");
        System.out.println("   - Cantidad de Roles: " + user.getRoles().size());

        user.getRoles().forEach(role ->
                System.out.println("   - Rol asignado: " + role.getName())
        );
        System.out.println("===============================================");

        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getUsername())
                .password(user.getPassword())
                .authorities(user.getRoles().stream()
                        .map(role -> new SimpleGrantedAuthority(role.getName()))
                        .collect(Collectors.toList()))
                .accountExpired(false)
                .accountLocked(false)
                .credentialsExpired(false)
                .disabled(!user.isEnabled())
                .build();
    }
}
