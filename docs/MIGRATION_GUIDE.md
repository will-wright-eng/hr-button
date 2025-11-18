# Incremental Migration Guide

This guide walks through the incremental migration process using the Makefile commands.

## Quick Start

### View All Commands

```bash
make help
```

### Verify Current State

```bash
make step-check    # Type-check + build
make step-verify   # Same as step-check
```

### Test API Keys

```bash
make test-keys     # Test both API keys
make test-gemini-key
make test-elevenlabs-key
```

## Phase-by-Phase Migration

### Phase 1: Setup Structure

**Goal**: Create directory structure, types, and configuration

**Steps**:

1. Create directories: `lib/services`, `lib/clients`, `lib/prompts`, `lib/types`, `lib/config`, `lib/utils`
2. Create type files: `lib/types/api.types.ts`, `lib/types/service.types.ts`, `lib/types/index.ts`
3. Create config files: `lib/config/models.config.ts`, `lib/config/voices.config.ts`, `lib/config/index.ts`

**Verification**:

```bash
make phase1-check-dirs      # Check directories exist
make phase1-check-types     # Check types exist + type-check
make phase1-check-config    # Check config exists + type-check
make phase1-verify          # Full Phase 1 verification
```

**After each file creation**:

```bash
make step-check             # Verify it compiles
```

---

### Phase 2: Extract Clients

**Goal**: Extract Gemini and Eleven Labs API calls into client classes

**Steps**:

1. Create `lib/clients/gemini.client.ts`
2. Create `lib/clients/elevenlabs.client.ts`
3. Create `lib/clients/index.ts`

**Verification**:

```bash
make phase2-check-gemini-client      # Check Gemini client
make phase2-check-elevenlabs-client  # Check Eleven Labs client
make phase2-check-clients-index      # Check index file
make phase2-verify                   # Full Phase 2 verification
```

**Optional Testing** (requires API keys):

```bash
make phase2-test-clients    # Test clients independently
```

**After each client creation**:

```bash
make step-check             # Verify it compiles
```

---

### Phase 3: Create Services

**Goal**: Create service layer that uses clients

**Steps**:

1. Create `lib/services/text-generation.service.ts`
2. Create `lib/services/audio-generation.service.ts`
3. Create `lib/services/combined.service.ts`
4. Create `lib/services/index.ts`

**Verification**:

```bash
make phase3-check-text-service      # Check text service
make phase3-check-audio-service     # Check audio service
make phase3-check-combined-service  # Check combined service
make phase3-check-services-index    # Check index file
make phase3-verify                  # Full Phase 3 verification
```

**After each service creation**:

```bash
make step-check             # Verify it compiles
```

---

### Phase 4: Prompt Management

**Goal**: Create prompt templates and builder system

**Steps**:

1. Create `lib/prompts/templates.ts`
2. Create `lib/prompts/builders.ts`
3. Create `lib/prompts/index.ts`

**Verification**:

```bash
make phase4-check-templates    # Check templates
make phase4-check-builders     # Check builders
make phase4-check-prompts-index # Check index file
make phase4-verify             # Full Phase 4 verification
```

**After each file creation**:

```bash
make step-check             # Verify it compiles
```

---

### Phase 5: Refactor Routes

**Goal**: Update API route and frontend to use new services

**Steps**:

1. Update `app/api/test-endpoint/route.ts` to use services
2. Update `app/page.tsx` to use new types and prompt builder

**Verification**:

```bash
make phase5-check-route      # Check route uses services
make phase5-check-frontend   # Check frontend
make phase5-verify           # Full Phase 5 verification
```

**Testing** (requires dev server):

```bash
# Terminal 1: Start dev server
make dev

# Terminal 2: Test API
make phase5-test-api
```

**After each change**:

```bash
make step-check             # Verify it compiles
```

---

### Phase 6: Error Handling

**Goal**: Implement proper error handling

**Steps**:

1. Create `lib/utils/errors.ts`
2. Create `lib/utils/index.ts`
3. Update routes to use error handling

**Verification**:

```bash
make phase6-check-errors        # Check error utilities
make phase6-check-error-usage   # Check error usage in routes
make phase6-verify              # Full Phase 6 verification
```

**After each change**:

```bash
make step-check             # Verify it compiles
```

---

## Full Verification

### Verify All Phases

```bash
make verify-all    # Run all phase verifications
```

### Verify Build

```bash
make verify-build  # Type-check + build
```

### Verify Dev Server

```bash
make verify-dev    # Quick dev server check
```

## Common Workflow

### During Development

1. **Make a change** (create a file, modify code, etc.)

2. **Check immediately**:

   ```bash
   make step-check
   ```

3. **If working on a specific phase**:

   ```bash
   make phase<N>-verify    # e.g., make phase1-verify
   ```

4. **Before committing**:
   ```bash
   make verify-build       # Ensure everything builds
   make lint              # Check linting
   ```

### Testing

1. **Start dev server**:

   ```bash
   make dev
   ```

2. **In another terminal, test API**:

   ```bash
   make phase5-test-api
   ```

3. **Or test manually**:
   ```bash
   curl -X POST http://localhost:3000/api/test-endpoint \
     -H "Content-Type: application/json" \
     -d '{"prompt":"Hello","generateAudio":false}'
   ```

## Troubleshooting

### Build Fails

```bash
make clean        # Clean build artifacts
make step-check   # Try again
```

### Type Errors

```bash
make type-check   # See detailed type errors
```

### Need Fresh Start

```bash
make clean-all    # Remove everything (including node_modules)
npm install       # Reinstall dependencies
```

## Incremental Checklist

Use this checklist as you work through each phase:

- [ ] **Phase 1**: Structure, types, config
  - [ ] `make phase1-verify` passes
- [ ] **Phase 2**: Clients extracted
  - [ ] `make phase2-verify` passes
- [ ] **Phase 3**: Services created
  - [ ] `make phase3-verify` passes
- [ ] **Phase 4**: Prompt management
  - [ ] `make phase4-verify` passes
- [ ] **Phase 5**: Routes refactored
  - [ ] `make phase5-verify` passes
  - [ ] `make phase5-test-api` works (with dev server)
- [ ] **Phase 6**: Error handling
  - [ ] `make phase6-verify` passes
- [ ] **Final**: All phases complete
  - [ ] `make verify-all` passes

## Tips

1. **Run `make step-check` frequently** - After every file creation or significant change
2. **Use phase-specific checks** - They give detailed feedback about what's missing
3. **Test incrementally** - Don't wait until the end to test
4. **Keep the app running** - Use `make dev` in one terminal while developing
5. **Check types early** - `make type-check` catches errors before runtime

## Next Steps

After completing all phases:

1. Add unit tests
2. Add integration tests
3. Update documentation
4. Consider adding more features from the design document
