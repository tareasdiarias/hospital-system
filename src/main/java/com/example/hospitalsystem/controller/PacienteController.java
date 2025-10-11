package com.example.hospitalsystem.controller;

import com.example.hospitalsystem.model.AntecedenteMedico;
import com.example.hospitalsystem.model.HistoriaClinica;
import com.example.hospitalsystem.model.Paciente;
import com.example.hospitalsystem.service.PacienteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pacientes")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class PacienteController {

    @Autowired
    private PacienteService pacienteService;

    // Todos los roles pueden VER pacientes
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'RECEPCIONISTA')")
    public ResponseEntity<List<Paciente>> getAllPacientes() {
        return ResponseEntity.ok(pacienteService.getAllPacientes());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'RECEPCIONISTA')")
    public ResponseEntity<Paciente> getPacienteById(@PathVariable Long id) {
        return pacienteService.getPacienteById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/dni/{dni}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'RECEPCIONISTA')")
    public ResponseEntity<Paciente> getPacienteByDni(@PathVariable String dni) {
        return pacienteService.getPacienteByDni(dni)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ADMIN y RECEPCIONISTA pueden CREAR pacientes
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPCIONISTA')")
    public ResponseEntity<Paciente> createPaciente(@RequestBody Paciente paciente) {
        Paciente savedPaciente = pacienteService.createPaciente(paciente);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedPaciente);
    }

    // ADMIN y RECEPCIONISTA pueden ACTUALIZAR pacientes
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPCIONISTA')")
    public ResponseEntity<Paciente> updatePaciente(@PathVariable Long id, @RequestBody Paciente paciente) {
        Paciente updatedPaciente = pacienteService.updatePaciente(id, paciente);
        if (updatedPaciente != null) {
            return ResponseEntity.ok(updatedPaciente);
        }
        return ResponseEntity.notFound().build();
    }

    // Solo ADMIN puede ELIMINAR pacientes
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deletePaciente(@PathVariable Long id) {
        if (pacienteService.deletePaciente(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    // ADMIN y DOCTOR pueden ver historia clínica
    @GetMapping("/{id}/historia-clinica")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<HistoriaClinica> getHistoriaClinica(@PathVariable Long id) {
        return pacienteService.getHistoriaClinicaByPaciente(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/historia/{idHistoria}/antecedentes")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<List<AntecedenteMedico>> getAntecedentes(@PathVariable Long idHistoria) {
        return ResponseEntity.ok(pacienteService.getAntecedentesByHistoria(idHistoria));
    }

    // Solo DOCTOR puede agregar antecedentes médicos
    @PostMapping("/historia/{idHistoria}/antecedentes")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<AntecedenteMedico> addAntecedente(@PathVariable Long idHistoria,
                                                            @RequestBody AntecedenteMedico antecedente) {
        antecedente.setIdHistoria(idHistoria);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(pacienteService.addAntecedenteMedico(antecedente));
    }
}
