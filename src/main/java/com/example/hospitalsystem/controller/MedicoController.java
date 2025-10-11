package com.example.hospitalsystem.controller;

import com.example.hospitalsystem.model.Especialidad;
import com.example.hospitalsystem.model.Medico;
import com.example.hospitalsystem.service.MedicoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/medicos")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class MedicoController {

    @Autowired
    private MedicoService medicoService;

    // Todos pueden VER médicos
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'RECEPCIONISTA')")
    public ResponseEntity<List<Medico>> getAllMedicos() {
        return ResponseEntity.ok(medicoService.getAllMedicos());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'RECEPCIONISTA')")
    public ResponseEntity<Medico> getMedicoById(@PathVariable Long id) {
        return medicoService.getMedicoById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Solo ADMIN puede CREAR médicos
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Medico> createMedico(@RequestBody Medico medico) {
        return ResponseEntity.status(HttpStatus.CREATED).body(medicoService.createMedico(medico));
    }

    // Solo ADMIN puede ACTUALIZAR médicos
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Medico> updateMedico(@PathVariable Long id, @RequestBody Medico medico) {
        Medico updatedMedico = medicoService.updateMedico(id, medico);
        if (updatedMedico != null) {
            return ResponseEntity.ok(updatedMedico);
        }
        return ResponseEntity.notFound().build();
    }

    // Solo ADMIN puede ELIMINAR médicos
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteMedico(@PathVariable Long id) {
        if (medicoService.deleteMedico(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    // Endpoints para Especialidades - Todos pueden ver
    @GetMapping("/especialidades")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'RECEPCIONISTA')")
    public ResponseEntity<List<Especialidad>> getAllEspecialidades() {
        return ResponseEntity.ok(medicoService.getAllEspecialidades());
    }

    @GetMapping("/especialidades/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'RECEPCIONISTA')")
    public ResponseEntity<Especialidad> getEspecialidadById(@PathVariable Long id) {
        return medicoService.getEspecialidadById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Solo ADMIN puede gestionar especialidades
    @PostMapping("/especialidades")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Especialidad> createEspecialidad(@RequestBody Especialidad especialidad) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(medicoService.createEspecialidad(especialidad));
    }

    @PutMapping("/especialidades/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Especialidad> updateEspecialidad(@PathVariable Long id,
                                                           @RequestBody Especialidad especialidad) {
        Especialidad updated = medicoService.updateEspecialidad(id, especialidad);
        if (updated != null) {
            return ResponseEntity.ok(updated);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/especialidades/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteEspecialidad(@PathVariable Long id) {
        if (medicoService.deleteEspecialidad(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
