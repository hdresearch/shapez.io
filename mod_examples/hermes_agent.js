// @ts-nocheck
/**
 * Hermes Agent Mod for shapez.io
 * 
 * Transforms shapez.io into a visual AI agent interface:
 * - Circle sources become prompt inputs (click to configure)
 * - Green circles = Gemini AI
 * - Red circles = Anthropic Claude
 * - Hub (center) receives circles and shows AI responses
 */

const METADATA = {
    website: "https://github.com/hdresearch/hermes-agent",
    author: "HDR",
    name: "Hermes Agent",
    version: "2.0.0",
    id: "hermes-agent",
    description: "Transform shapez.io into a visual AI agent. Configure prompts on circle sources, deliver to hub for AI responses.",
    minimumGameVersion: ">=1.5.0",
    doesNotAffectSavegame: true,
};

// ============================================================================
// HERMES BUILDING DESCRIPTIONS
// ============================================================================

const HERMES_BUILDINGS = {
    miner: {
        name: "AI Prompt Source",
        description: "🎯 <strong>Double-click to set a prompt.</strong><br><br>Place on colored circles to create AI requests:<br>• <span style='color:#4ecdc4'>Green circles</span> → Gemini AI<br>• <span style='color:#e94560'>Red circles</span> → Anthropic Claude<br><br>Connect to belts to send prompts to the Hub."
    },
    belt: {
        name: "Data Pipeline",
        description: "📡 <strong>Transports AI requests to the Hub.</strong><br><br>Connect miners (prompt sources) to the Hub. Shapes flowing on belts represent queued AI requests waiting to be processed."
    },
    hub: {
        name: "AI Processing Hub",
        description: "🧠 <strong>The AI brain - processes all incoming requests.</strong><br><br>When shapes arrive here:<br>• Green circles trigger <strong>Gemini</strong> with your prompt<br>• Red circles trigger <strong>Claude</strong> with your prompt<br><br>Responses appear as notifications."
    },
    balancer: {
        name: "Load Balancer",
        description: "⚖️ <strong>Distributes requests across multiple AI providers.</strong><br><br>Use to split traffic between Gemini and Claude, or to merge multiple prompt streams into one pipeline."
    },
    underground_belt: {
        name: "Secure Tunnel",
        description: "🔒 <strong>Hidden data channel.</strong><br><br>Routes AI requests underground to bypass obstacles. Useful for complex factory layouts where you need requests to cross other pipelines."
    },
    cutter: {
        name: "Prompt Splitter",
        description: "✂️ <strong>Splits prompts for parallel processing.</strong><br><br>Takes one request and creates two copies - useful for sending the same prompt to both Gemini and Claude simultaneously."
    },
    rotater: {
        name: "Context Rotator",
        description: "🔄 <strong>Transforms request context.</strong><br><br>Rotates the shape representation - in Hermes terms, this can modify how context is passed between AI calls."
    },
    stacker: {
        name: "Context Combiner",
        description: "📚 <strong>Combines multiple contexts.</strong><br><br>Stacks two shapes together - use this to merge outputs from multiple AI calls into a combined context for downstream processing."
    },
    mixer: {
        name: "Prompt Mixer",
        description: "🎨 <strong>Blends AI provider responses.</strong><br><br>Combines colors (providers) to create hybrid requests. Mix green + red to get a request that queries both AIs."
    },
    painter: {
        name: "Provider Selector",
        description: "🖌️ <strong>Assigns AI provider to requests.</strong><br><br>Paint shapes with colors to route them to specific AIs:<br>• Green → Gemini<br>• Red → Claude<br>• Other colors → Future providers"
    },
    trash: {
        name: "Request Canceller",
        description: "🗑️ <strong>Discards unwanted requests.</strong><br><br>Drops shapes into the void. Use to filter out requests you don't want to send to the AI."
    },
    storage: {
        name: "Request Buffer",
        description: "📦 <strong>Queues requests for batch processing.</strong><br><br>Stores shapes until needed. Useful for rate-limiting AI calls or batching multiple prompts together."
    },
    filter: {
        name: "Request Router",
        description: "🔀 <strong>Routes requests by shape/color.</strong><br><br>Sends matching shapes one direction, others another way. Use to separate Gemini vs Claude requests in your pipeline."
    },
    display: {
        name: "Response Display",
        description: "📺 <strong>Shows AI response status.</strong><br><br>Displays the current shape/color being processed. Wire it up to visualize which AI provider is handling requests."
    },
    lever: {
        name: "Manual Trigger",
        description: "🎚️ <strong>Manually control AI request flow.</strong><br><br>Toggle on/off to start or pause sending requests to the AI. Useful for testing prompts before enabling continuous flow."
    },
    wire: {
        name: "Signal Wire",
        description: "⚡ <strong>Carries control signals.</strong><br><br>Wires connect logic components. Use them to create conditional flows - e.g., only send to Claude if Gemini is busy."
    },
    constant_signal: {
        name: "Constant Config",
        description: "📌 <strong>Provides fixed configuration values.</strong><br><br>Outputs a constant signal. Use to set static parameters like temperature, max tokens, or provider preferences."
    },
    logic_gate: {
        name: "Logic Controller",
        description: "🔲 <strong>Conditional AI routing.</strong><br><br>AND, OR, XOR, NOT gates for complex logic. Example: Only call Claude AND Gemini if both are available."
    },
    virtual_processor: {
        name: "Signal Processor",
        description: "🔧 <strong>Transforms control signals.</strong><br><br>Performs operations on wired values. Use to compute routing decisions based on response quality or latency."
    },
    reader: {
        name: "Response Reader",
        description: "📖 <strong>Reads shape data as signals.</strong><br><br>Converts belt items to wire signals. Use to check what type of request is passing through and route accordingly."
    },
    comparator: {
        name: "Response Comparator",
        description: "⚖️ <strong>Compares two signals.</strong><br><br>Outputs true if conditions match. Use to compare Gemini vs Claude response quality scores."
    },
    transistor: {
        name: "Flow Gate",
        description: "🚦 <strong>Signal-controlled belt gate.</strong><br><br>Passes items only when wire signal is true. Use to pause AI requests based on conditions."
    },
    analyzer: {
        name: "Request Analyzer",
        description: "🔬 <strong>Inspects request properties.</strong><br><br>Outputs the shape/color of items. Use to log or debug what requests are flowing through your pipeline."
    },
    item_producer: {
        name: "Test Request Generator",
        description: "🏭 <strong>Generates test requests.</strong><br><br>Produces shapes on demand. Use for testing your AI pipeline without configuring real prompts."
    },
    goal_acceptor: {
        name: "Goal Validator",
        description: "🎯 <strong>Validates pipeline output.</strong><br><br>Checks if delivered shapes match a goal. Use to verify your AI routing logic is working correctly."
    },
    block: {
        name: "Pipeline Block",
        description: "🧱 <strong>Structural element.</strong><br><br>A solid block for organizing your factory layout. Use to create visual separation between different AI processing stages."
    },
    constant_producer: {
        name: "Infinite Source",
        description: "♾️ <strong>Unlimited request source.</strong><br><br>Continuously produces shapes. Use for stress-testing your AI pipeline with constant requests."
    },
    wire_tunnel: {
        name: "Signal Tunnel",
        description: "🚇 <strong>Underground signal routing.</strong><br><br>Routes wire signals under obstacles. Use for complex logic layouts where wires need to cross."
    }
};

class Mod extends shapez.Mod {
    init() {
        console.log("[Hermes] Mod initializing...");
        
        // ====================================================================
        // OVERRIDE TUTORIAL HINTS FOR HERMES AGENT
        // ====================================================================
        
        this.modInterface.registerTranslations("en", {
            ingame: {
                interactiveTutorial: {
                    title: "Hermes Agent Tutorial",
                    hints: {
                        "1_1_extractor": "Place an <strong>AI Prompt Source</strong> on a shape to start extracting AI requests!",
                        "1_2_conveyor": "Connect the prompt source to the <strong>AI Hub</strong> with a <strong>Data Pipeline</strong> (conveyor belt)!<br><br>Tip: <strong>Double-click</strong> the prompt source to set your prompt!",
                        "1_3_expand": "Build more prompt sources to process multiple AI requests! Use <strong>painters</strong> to route to different AI providers:<br>• <strong>Green</strong> → Gemini<br>• <strong>Red</strong> → Claude",
                    },
                },
            },
        });
        
        // Store prompts per entity (by entity uid)
        this.entityPrompts = {};
        
        // Legacy provider-based prompts (for painted shapes)
        this.prompts = {
            gemini: "",
            anthropic: ""
        };
        
        // Response queue for display
        this.responseQueue = [];
        
        // WebSocket connection to Hermes
        this.ws = null;
        this.wsConnected = false;
        this.pendingRequests = [];
        
        // Don't connect here - wait for game init
        
        const mod = this;
        
        // ====================================================================
        // OVERRIDE ALL BUILDING NAMES AND DESCRIPTIONS
        // ====================================================================
        
        // Miner
        this.modInterface.replaceMethod(shapez.MetaMinerBuilding, "getName", function() {
            return HERMES_BUILDINGS.miner.name;
        });
        this.modInterface.replaceMethod(shapez.MetaMinerBuilding, "getDescription", function() {
            return HERMES_BUILDINGS.miner.description;
        });
        
        // Belt
        this.modInterface.replaceMethod(shapez.MetaBeltBuilding, "getName", function() {
            return HERMES_BUILDINGS.belt.name;
        });
        this.modInterface.replaceMethod(shapez.MetaBeltBuilding, "getDescription", function() {
            return HERMES_BUILDINGS.belt.description;
        });
        
        // Hub
        this.modInterface.replaceMethod(shapez.MetaHubBuilding, "getName", function() {
            return HERMES_BUILDINGS.hub.name;
        });
        this.modInterface.replaceMethod(shapez.MetaHubBuilding, "getDescription", function() {
            return HERMES_BUILDINGS.hub.description;
        });
        
        // Balancer
        if (shapez.MetaBalancerBuilding) {
            this.modInterface.replaceMethod(shapez.MetaBalancerBuilding, "getName", function() {
                return HERMES_BUILDINGS.balancer.name;
            });
            this.modInterface.replaceMethod(shapez.MetaBalancerBuilding, "getDescription", function() {
                return HERMES_BUILDINGS.balancer.description;
            });
        }
        
        // Underground Belt
        if (shapez.MetaUndergroundBeltBuilding) {
            this.modInterface.replaceMethod(shapez.MetaUndergroundBeltBuilding, "getName", function() {
                return HERMES_BUILDINGS.underground_belt.name;
            });
            this.modInterface.replaceMethod(shapez.MetaUndergroundBeltBuilding, "getDescription", function() {
                return HERMES_BUILDINGS.underground_belt.description;
            });
        }
        
        // Cutter
        if (shapez.MetaCutterBuilding) {
            this.modInterface.replaceMethod(shapez.MetaCutterBuilding, "getName", function() {
                return HERMES_BUILDINGS.cutter.name;
            });
            this.modInterface.replaceMethod(shapez.MetaCutterBuilding, "getDescription", function() {
                return HERMES_BUILDINGS.cutter.description;
            });
        }
        
        // Rotater
        if (shapez.MetaRotaterBuilding) {
            this.modInterface.replaceMethod(shapez.MetaRotaterBuilding, "getName", function() {
                return HERMES_BUILDINGS.rotater.name;
            });
            this.modInterface.replaceMethod(shapez.MetaRotaterBuilding, "getDescription", function() {
                return HERMES_BUILDINGS.rotater.description;
            });
        }
        
        // Stacker
        if (shapez.MetaStackerBuilding) {
            this.modInterface.replaceMethod(shapez.MetaStackerBuilding, "getName", function() {
                return HERMES_BUILDINGS.stacker.name;
            });
            this.modInterface.replaceMethod(shapez.MetaStackerBuilding, "getDescription", function() {
                return HERMES_BUILDINGS.stacker.description;
            });
        }
        
        // Mixer
        if (shapez.MetaMixerBuilding) {
            this.modInterface.replaceMethod(shapez.MetaMixerBuilding, "getName", function() {
                return HERMES_BUILDINGS.mixer.name;
            });
            this.modInterface.replaceMethod(shapez.MetaMixerBuilding, "getDescription", function() {
                return HERMES_BUILDINGS.mixer.description;
            });
        }
        
        // Painter
        if (shapez.MetaPainterBuilding) {
            this.modInterface.replaceMethod(shapez.MetaPainterBuilding, "getName", function() {
                return HERMES_BUILDINGS.painter.name;
            });
            this.modInterface.replaceMethod(shapez.MetaPainterBuilding, "getDescription", function() {
                return HERMES_BUILDINGS.painter.description;
            });
        }
        
        // Trash
        if (shapez.MetaTrashBuilding) {
            this.modInterface.replaceMethod(shapez.MetaTrashBuilding, "getName", function() {
                return HERMES_BUILDINGS.trash.name;
            });
            this.modInterface.replaceMethod(shapez.MetaTrashBuilding, "getDescription", function() {
                return HERMES_BUILDINGS.trash.description;
            });
        }
        
        // Storage
        if (shapez.MetaStorageBuilding) {
            this.modInterface.replaceMethod(shapez.MetaStorageBuilding, "getName", function() {
                return HERMES_BUILDINGS.storage.name;
            });
            this.modInterface.replaceMethod(shapez.MetaStorageBuilding, "getDescription", function() {
                return HERMES_BUILDINGS.storage.description;
            });
        }
        
        // Filter
        if (shapez.MetaFilterBuilding) {
            this.modInterface.replaceMethod(shapez.MetaFilterBuilding, "getName", function() {
                return HERMES_BUILDINGS.filter.name;
            });
            this.modInterface.replaceMethod(shapez.MetaFilterBuilding, "getDescription", function() {
                return HERMES_BUILDINGS.filter.description;
            });
        }
        
        // Display
        if (shapez.MetaDisplayBuilding) {
            this.modInterface.replaceMethod(shapez.MetaDisplayBuilding, "getName", function() {
                return HERMES_BUILDINGS.display.name;
            });
            this.modInterface.replaceMethod(shapez.MetaDisplayBuilding, "getDescription", function() {
                return HERMES_BUILDINGS.display.description;
            });
        }
        
        // Lever
        if (shapez.MetaLeverBuilding) {
            this.modInterface.replaceMethod(shapez.MetaLeverBuilding, "getName", function() {
                return HERMES_BUILDINGS.lever.name;
            });
            this.modInterface.replaceMethod(shapez.MetaLeverBuilding, "getDescription", function() {
                return HERMES_BUILDINGS.lever.description;
            });
        }
        
        // Wire
        if (shapez.MetaWireBuilding) {
            this.modInterface.replaceMethod(shapez.MetaWireBuilding, "getName", function() {
                return HERMES_BUILDINGS.wire.name;
            });
            this.modInterface.replaceMethod(shapez.MetaWireBuilding, "getDescription", function() {
                return HERMES_BUILDINGS.wire.description;
            });
        }
        
        // Constant Signal
        if (shapez.MetaConstantSignalBuilding) {
            this.modInterface.replaceMethod(shapez.MetaConstantSignalBuilding, "getName", function() {
                return HERMES_BUILDINGS.constant_signal.name;
            });
            this.modInterface.replaceMethod(shapez.MetaConstantSignalBuilding, "getDescription", function() {
                return HERMES_BUILDINGS.constant_signal.description;
            });
        }
        
        // Logic Gate
        if (shapez.MetaLogicGateBuilding) {
            this.modInterface.replaceMethod(shapez.MetaLogicGateBuilding, "getName", function() {
                return HERMES_BUILDINGS.logic_gate.name;
            });
            this.modInterface.replaceMethod(shapez.MetaLogicGateBuilding, "getDescription", function() {
                return HERMES_BUILDINGS.logic_gate.description;
            });
        }
        
        // Virtual Processor
        if (shapez.MetaVirtualProcessorBuilding) {
            this.modInterface.replaceMethod(shapez.MetaVirtualProcessorBuilding, "getName", function() {
                return HERMES_BUILDINGS.virtual_processor.name;
            });
            this.modInterface.replaceMethod(shapez.MetaVirtualProcessorBuilding, "getDescription", function() {
                return HERMES_BUILDINGS.virtual_processor.description;
            });
        }
        
        // Reader
        if (shapez.MetaReaderBuilding) {
            this.modInterface.replaceMethod(shapez.MetaReaderBuilding, "getName", function() {
                return HERMES_BUILDINGS.reader.name;
            });
            this.modInterface.replaceMethod(shapez.MetaReaderBuilding, "getDescription", function() {
                return HERMES_BUILDINGS.reader.description;
            });
        }
        
        // Comparator
        if (shapez.MetaComparatorBuilding) {
            this.modInterface.replaceMethod(shapez.MetaComparatorBuilding, "getName", function() {
                return HERMES_BUILDINGS.comparator.name;
            });
            this.modInterface.replaceMethod(shapez.MetaComparatorBuilding, "getDescription", function() {
                return HERMES_BUILDINGS.comparator.description;
            });
        }
        
        // Transistor
        if (shapez.MetaTransistorBuilding) {
            this.modInterface.replaceMethod(shapez.MetaTransistorBuilding, "getName", function() {
                return HERMES_BUILDINGS.transistor.name;
            });
            this.modInterface.replaceMethod(shapez.MetaTransistorBuilding, "getDescription", function() {
                return HERMES_BUILDINGS.transistor.description;
            });
        }
        
        // Analyzer
        if (shapez.MetaAnalyzerBuilding) {
            this.modInterface.replaceMethod(shapez.MetaAnalyzerBuilding, "getName", function() {
                return HERMES_BUILDINGS.analyzer.name;
            });
            this.modInterface.replaceMethod(shapez.MetaAnalyzerBuilding, "getDescription", function() {
                return HERMES_BUILDINGS.analyzer.description;
            });
        }
        
        // Item Producer
        if (shapez.MetaItemProducerBuilding) {
            this.modInterface.replaceMethod(shapez.MetaItemProducerBuilding, "getName", function() {
                return HERMES_BUILDINGS.item_producer.name;
            });
            this.modInterface.replaceMethod(shapez.MetaItemProducerBuilding, "getDescription", function() {
                return HERMES_BUILDINGS.item_producer.description;
            });
        }
        
        // Goal Acceptor
        if (shapez.MetaGoalAcceptorBuilding) {
            this.modInterface.replaceMethod(shapez.MetaGoalAcceptorBuilding, "getName", function() {
                return HERMES_BUILDINGS.goal_acceptor.name;
            });
            this.modInterface.replaceMethod(shapez.MetaGoalAcceptorBuilding, "getDescription", function() {
                return HERMES_BUILDINGS.goal_acceptor.description;
            });
        }
        
        // Block
        if (shapez.MetaBlockBuilding) {
            this.modInterface.replaceMethod(shapez.MetaBlockBuilding, "getName", function() {
                return HERMES_BUILDINGS.block.name;
            });
            this.modInterface.replaceMethod(shapez.MetaBlockBuilding, "getDescription", function() {
                return HERMES_BUILDINGS.block.description;
            });
        }
        
        // Constant Producer
        if (shapez.MetaConstantProducerBuilding) {
            this.modInterface.replaceMethod(shapez.MetaConstantProducerBuilding, "getName", function() {
                return HERMES_BUILDINGS.constant_producer.name;
            });
            this.modInterface.replaceMethod(shapez.MetaConstantProducerBuilding, "getDescription", function() {
                return HERMES_BUILDINGS.constant_producer.description;
            });
        }
        
        // Wire Tunnel
        if (shapez.MetaWireTunnelBuilding) {
            this.modInterface.replaceMethod(shapez.MetaWireTunnelBuilding, "getName", function() {
                return HERMES_BUILDINGS.wire_tunnel.name;
            });
            this.modInterface.replaceMethod(shapez.MetaWireTunnelBuilding, "getDescription", function() {
                return HERMES_BUILDINGS.wire_tunnel.description;
            });
        }
        
        // ====================================================================
        // INTERCEPT HUB DELIVERY TO TRIGGER AI
        // ====================================================================
        
        // Use runAfterMethod to add AI logic after the original hub processing
        this.modInterface.runAfterMethod(
            shapez.ItemProcessorSystem,
            "process_HUB", 
            function(payload) {
                // Original method already ran - now add our AI logic
                for (let i = 0; i < payload.inputCount; ++i) {
                    const item = payload.items.get(i);
                    if (!item) continue;
                    
                    // Check if it's a shape item
                    if (item.getItemType && item.getItemType() === "shape") {
                        const definition = item.definition;
                        const layers = definition.layers;
                        
                        if (layers && layers.length > 0) {
                            const firstLayer = layers[0];
                            const firstQuad = firstLayer[0];
                            
                            if (firstQuad) {
                                const color = firstQuad.color;
                                
                                // Only invoke AI for painted shapes (green = gemini, red = anthropic)
                                // Unpainted/uncolored shapes are ignored
                                if (color !== "green" && color !== "red") {
                                    // Not a colored shape - don't invoke AI
                                    continue;
                                }
                                
                                // Determine provider based on color (set by painter block)
                                let provider = color === "red" ? "anthropic" : "gemini";
                                
                                // Find any prompt set for this shape type
                                let prompt = null;
                                
                                // Check entity-specific prompts (from double-clicked miners)
                                for (const entityId in mod.entityPrompts) {
                                    if (mod.entityPrompts[entityId]) {
                                        prompt = mod.entityPrompts[entityId];
                                        break; // Use first available prompt
                                    }
                                }
                                
                                if (prompt) {
                                    mod.sendToAI(provider, prompt);
                                }
                                // No warning if no prompt - just silently ignore
                            }
                        }
                    }
                }
            }
        );
        
        // ====================================================================
        // GAME INITIALIZATION HOOKS
        // ====================================================================
        
        this.signals.gameInitialized.add(root => {
            mod.root = root;
            console.log("[Hermes] Game initialized, setting up event handlers");
            
            // Create the prompt dialog UI (must be done when DOM is ready)
            this.createPromptDialog();
            
            // Add double-click handler directly to the game canvas
            if (root.canvas) {
                console.log("[Hermes] Attaching dblclick handler to canvas");
                root.canvas.addEventListener("dblclick", (e) => {
                    console.log("[Hermes] Canvas double-click detected at", e.clientX, e.clientY);
                    mod.handleDoubleClick(e, root);
                });
            } else {
                console.warn("[Hermes] Canvas not found, using document fallback");
                document.addEventListener("dblclick", (e) => {
                    mod.handleDoubleClick(e, root);
                });
            }
            
            // Hook into game tick for response display updates
            root.signals.gameFrameStarted.add(() => {
                mod.updateResponses();
            });
            
            // Connect to WebSocket when game starts
            console.log("[Hermes] Game ready, connecting WebSocket...");
            mod.connectWebSocket();
            
            // Show initial message immediately
            mod.showResponse("🤖 Hermes Agent loading...", "loading");
        });
        
        console.log("[Hermes] Mod initialized successfully");
    }
    
    // ========================================================================
    // WEBSOCKET CONNECTION
    // ========================================================================
    
    connectWebSocket() {
        const mod = this;
        
        // Don't create multiple connections
        if (this.ws && (this.ws.readyState === WebSocket.CONNECTING || this.ws.readyState === WebSocket.OPEN)) {
            console.log("[Hermes] WebSocket already connecting/connected, skipping. State:", this.ws.readyState);
            return;
        }
        
        console.log("[Hermes] Creating new WebSocket connection to ws://localhost:8765...");
        
        try {
            this.ws = new WebSocket("ws://localhost:8765");
            console.log("[Hermes] WebSocket object created, readyState:", this.ws.readyState);
            
            this.ws.onopen = function(event) {
                console.log("[Hermes] WebSocket OPEN!", event);
                mod.wsConnected = true;
                mod.showResponse("🔗 Connected to Hermes Agent", "success");
                // Process any requests that were queued while connecting
                mod.processPendingRequests();
            };
            
            this.ws.onmessage = function(event) {
                console.log("[Hermes] WebSocket message received:", event.data.substring(0, 100));
                try {
                    const data = JSON.parse(event.data);
                    mod.handleWebSocketMessage(data);
                } catch (e) {
                    console.error("[Hermes] Failed to parse message:", e);
                }
            };
            
            this.ws.onclose = function(event) {
                console.log("[Hermes] WebSocket CLOSED! Code:", event.code, "Reason:", event.reason, "Clean:", event.wasClean);
                mod.wsConnected = false;
                mod.ws = null;
                setTimeout(function() { mod.connectWebSocket(); }, 5000);
            };
            
            this.ws.onerror = function(error) {
                console.error("[Hermes] WebSocket ERROR:", error);
                mod.wsConnected = false;
            };
        } catch (e) {
            console.error("[Hermes] Failed to create WebSocket:", e);
            this.ws = null;
            setTimeout(function() { mod.connectWebSocket(); }, 5000);
        }
    }
    
    handleWebSocketMessage(data) {
        if (data.type === "ai_response") {
            const provider = data.provider || "AI";
            const response = data.response || data.result || "No response";
            const icon = provider === "gemini" ? "💚" : "❤️";
            this.showResponse(icon + " " + provider.toUpperCase() + ": " + response, "ai");
        } else if (data.type === "error") {
            this.showResponse("❌ Error: " + data.message, "error");
        }
    }
    
    // ========================================================================
    // AI REQUEST HANDLING
    // ========================================================================
    
    sendToAI(provider, prompt) {
        console.log("[Hermes] sendToAI called:", provider, prompt);
        
        // Check WebSocket state
        if (!this.ws || this.ws.readyState === WebSocket.CLOSED || this.ws.readyState === WebSocket.CLOSING) {
            console.warn("[Hermes] No WebSocket or closed, connecting...");
            this.connectWebSocket();
            // Queue this request
            this.pendingRequests.push({provider, prompt});
            this.showResponse("⚠️ Connecting to Hermes...", "warning");
            return;
        }
        
        const readyState = this.ws.readyState;
        console.log("[Hermes] WebSocket readyState:", readyState, "(0=CONNECTING, 1=OPEN)");
        
        if (readyState === WebSocket.CONNECTING) {
            // Queue and wait - don't spam retries
            console.log("[Hermes] Still connecting, queuing request");
            this.pendingRequests.push({provider, prompt});
            if (this.pendingRequests.length === 1) {
                // Only show message for first queued request
                this.showResponse("⏳ Connecting to Hermes...", "loading");
            }
            return;
        }
        
        if (readyState !== WebSocket.OPEN) {
            console.warn("[Hermes] WebSocket not open (state=" + readyState + ")");
            this.showResponse("❌ WebSocket not connected", "error");
            return;
        }
        
        const icon = provider === "gemini" ? "💚" : "❤️";
        this.showResponse(icon + " Asking " + provider.toUpperCase() + "...", "loading");
        
        const message = JSON.stringify({
            type: "ai_request",
            request_id: Date.now().toString(),
            provider: provider,
            prompt: prompt
        });
        console.log("[Hermes] Sending WebSocket message:", message);
        
        try {
            this.ws.send(message);
            console.log("[Hermes] Message sent successfully");
        } catch (e) {
            console.error("[Hermes] Failed to send message:", e);
            this.showResponse("❌ Failed to send: " + e.message, "error");
        }
    }
    
    // Process any pending requests when connection opens
    processPendingRequests() {
        console.log("[Hermes] Processing", this.pendingRequests.length, "pending requests");
        while (this.pendingRequests.length > 0) {
            const req = this.pendingRequests.shift();
            this.sendToAI(req.provider, req.prompt);
        }
    }
    
    // ========================================================================
    // DOUBLE CLICK HANDLER
    // ========================================================================
    
    handleDoubleClick(event, root) {
        if (!root || !root.camera) {
            console.warn("[Hermes] No root or camera");
            return;
        }
        
        // Get mouse position relative to canvas
        const canvas = root.canvas;
        const rect = canvas.getBoundingClientRect();
        const screenX = event.clientX - rect.left;
        const screenY = event.clientY - rect.top;
        
        console.log("[Hermes] Screen coords:", screenX, screenY);
        
        try {
            const worldPos = root.camera.screenToWorld(new shapez.Vector(screenX, screenY));
            console.log("[Hermes] World pos:", worldPos.x, worldPos.y);
            
            const tileX = Math.floor(worldPos.x / shapez.globalConfig.tileSize);
            const tileY = Math.floor(worldPos.y / shapez.globalConfig.tileSize);
            console.log("[Hermes] Tile:", tileX, tileY);
            
            const contents = root.map.getLayersContentsMultipleXY(tileX, tileY);
            console.log("[Hermes] Found", contents.length, "entities at tile");
            
            for (let i = 0; i < contents.length; i++) {
                const entity = contents[i];
                console.log("[Hermes] Checking entity:", entity, entity?.components);
                
                if (entity && entity.components && entity.components.Miner) {
                    console.log("[Hermes] Found miner!");
                    this.showPromptDialog(null, entity);
                    return;
                }
            }
            
            console.log("[Hermes] No miner found at this location");
        } catch (e) {
            console.error("[Hermes] Error handling double click:", e);
        }
    }
    
    // ========================================================================
    // PROMPT DIALOG UI
    // ========================================================================
    
    createPromptDialog() {
        // Create overlay
        const overlay = document.createElement("div");
        overlay.id = "hermes-dialog-overlay";
        overlay.style.cssText = "display:none;position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.7);z-index:99999;";
        
        // Create dialog
        const dialog = document.createElement("div");
        dialog.id = "hermes-prompt-dialog";
        dialog.style.cssText = "display:none;position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:linear-gradient(135deg,#1a1a2e,#16213e);border:2px solid #4ecdc4;border-radius:12px;padding:24px;z-index:100000;min-width:400px;max-width:600px;box-shadow:0 20px 60px rgba(0,0,0,0.5);font-family:sans-serif;";
        
        dialog.innerHTML = '<div style="display:flex;align-items:center;margin-bottom:16px;">' +
            '<span id="hermes-dialog-icon" style="font-size:32px;margin-right:12px;">🤖</span>' +
            '<div><h2 id="hermes-dialog-title" style="margin:0;color:#fff;font-size:18px;">Set Prompt</h2>' +
            '<p style="margin:4px 0 0;color:#888;font-size:12px;">This prompt will be sent when shapes reach the AI Hub. Use painters to choose provider (green=Gemini, red=Claude)</p></div></div>' +
            '<textarea id="hermes-prompt-input" placeholder="Enter your prompt here..." style="width:100%;height:120px;background:#0d1117;border:1px solid #30363d;border-radius:8px;color:#e6edf3;padding:12px;font-size:14px;resize:vertical;box-sizing:border-box;"></textarea>' +
            '<p style="margin:8px 0 0;color:#666;font-size:11px;">Press Ctrl+Enter to save, Escape to cancel</p>' +
            '<div style="display:flex;justify-content:flex-end;gap:12px;margin-top:16px;">' +
            '<button id="hermes-cancel-btn" style="padding:10px 20px;background:transparent;border:1px solid #30363d;border-radius:6px;color:#888;cursor:pointer;">Cancel</button>' +
            '<button id="hermes-save-btn" style="padding:10px 24px;background:linear-gradient(135deg,#4ecdc4,#44a08d);border:none;border-radius:6px;color:#fff;cursor:pointer;font-weight:600;">Save Prompt</button></div>';
        
        document.body.appendChild(overlay);
        document.body.appendChild(dialog);
        
        const mod = this;
        
        document.getElementById("hermes-save-btn").onclick = function() {
            const input = document.getElementById("hermes-prompt-input");
            const prompt = input.value.trim();
            if (mod.currentDialogEntity) {
                const entityId = mod.currentDialogEntity.uid;
                mod.entityPrompts[entityId] = prompt;
                mod.showResponse("✅ Prompt saved!", "success");
            }
            mod.hidePromptDialog();
        };
        
        document.getElementById("hermes-cancel-btn").onclick = function() {
            mod.hidePromptDialog();
        };
        
        overlay.onclick = function() {
            mod.hidePromptDialog();
        };
        
        // Stop all key events from propagating when dialog is open
        const input = document.getElementById("hermes-prompt-input");
        input.addEventListener("keydown", function(e) {
            e.stopPropagation();
            
            // Ctrl+Enter to save
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                document.getElementById("hermes-save-btn").click();
            }
            // Escape to cancel
            if (e.key === "Escape") {
                mod.hidePromptDialog();
            }
        });
        
        input.addEventListener("keyup", function(e) {
            e.stopPropagation();
        });
        
        input.addEventListener("keypress", function(e) {
            e.stopPropagation();
        });
        
        document.addEventListener("keydown", function(e) {
            if (e.key === "Escape" && document.getElementById("hermes-prompt-dialog").style.display !== "none") {
                mod.hidePromptDialog();
            }
        });
    }
    
    currentDialogEntity = null;
    
    showPromptDialog(provider, entity) {
        this.currentDialogEntity = entity;
        
        const dialog = document.getElementById("hermes-prompt-dialog");
        const overlay = document.getElementById("hermes-dialog-overlay");
        const icon = document.getElementById("hermes-dialog-icon");
        const title = document.getElementById("hermes-dialog-title");
        const input = document.getElementById("hermes-prompt-input");
        
        // Generic prompt dialog (provider determined by paint block later)
        icon.textContent = "🤖";
        title.textContent = "Set Prompt";
        dialog.style.borderColor = "#4ecdc4";
        
        // Get existing prompt for this entity if any
        const entityId = entity.uid;
        input.value = this.entityPrompts[entityId] || "";
        
        overlay.style.display = "block";
        dialog.style.display = "block";
        input.focus();
    }
    
    hidePromptDialog() {
        document.getElementById("hermes-prompt-dialog").style.display = "none";
        document.getElementById("hermes-dialog-overlay").style.display = "none";
        this.currentDialogEntity = null;
    }
    
    // ========================================================================
    // RESPONSE DISPLAY (Toast notifications)
    // ========================================================================
    
    showResponse(message, type) {
        type = type || "info";
        
        this.responseQueue.push({
            message: message,
            type: type,
            time: Date.now(),
            duration: type === "ai" ? 10000 : 4000
        });
        
        // Keep only last 5
        while (this.responseQueue.length > 5) {
            this.responseQueue.shift();
        }
        
        this.renderResponses();
    }
    
    updateResponses() {
        const now = Date.now();
        const before = this.responseQueue.length;
        
        this.responseQueue = this.responseQueue.filter(function(r) {
            return now - r.time < r.duration;
        });
        
        if (this.responseQueue.length !== before) {
            this.renderResponses();
        }
    }
    
    renderResponses() {
        // Remove existing container
        let container = document.getElementById("hermes-responses");
        if (container) {
            container.remove();
        }
        
        if (this.responseQueue.length === 0) return;
        
        // Create container
        container = document.createElement("div");
        container.id = "hermes-responses";
        container.style.cssText = "position:fixed;bottom:20px;left:20px;z-index:99998;max-width:500px;pointer-events:none;";
        
        const colors = {
            ai: "#27ae60",
            success: "#2ecc71",
            warning: "#f1c40f",
            error: "#e74c3c",
            loading: "#3498db",
            info: "#34495e"
        };
        
        for (let i = 0; i < this.responseQueue.length; i++) {
            const r = this.responseQueue[i];
            const age = Date.now() - r.time;
            const opacity = Math.max(0.3, 1 - (age / r.duration));
            
            const toast = document.createElement("div");
            toast.style.cssText = "background:" + (colors[r.type] || colors.info) + ";color:#fff;padding:12px 16px;border-radius:8px;margin-bottom:8px;font-family:sans-serif;font-size:14px;box-shadow:0 4px 12px rgba(0,0,0,0.3);opacity:" + opacity + ";word-wrap:break-word;";
            toast.textContent = r.message;
            container.appendChild(toast);
        }
        
        document.body.appendChild(container);
    }
}
