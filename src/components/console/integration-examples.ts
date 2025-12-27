export interface IntegrationExample {
  id: string
  label: string
  description: string
  code: (supabaseUrl: string) => string
}

export const integrationExamples: IntegrationExample[] = [
  {
    id: 'nextjs',
    label: 'Next.js',
    description: 'Using NextAuth.js',
    code: (supabaseUrl) => `// [...nextauth].ts
export const authOptions = {
  providers: [
    {
      id: 'supabase-oauth',
      name: 'Supabase',
      type: 'oauth',
      clientId: 'YOUR_CLIENT_ID',
      clientSecret: 'YOUR_CLIENT_SECRET',
      wellKnown: '${supabaseUrl}/auth/v1/.well-known/openid-configuration',
      authorization: { params: { scope: 'openid email profile' } },
      idToken: true,
      checks: ['pkce', 'state'],
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        }
      },
    },
  ],
}`
  },
  {
    id: 'react',
    label: 'React',
    description: 'Using react-oidc-context',
    code: (supabaseUrl) => `import { AuthProvider } from "react-oidc-context";

const oidcConfig = {
  authority: "${supabaseUrl}/auth/v1",
  client_id: "YOUR_CLIENT_ID",
  redirect_uri: "http://localhost:3000",
  onSigninCallback: (_user) => {
    window.history.replaceState({}, document.title, window.location.pathname)
  }
};

function App() {
  return <AuthProvider {...oidcConfig}><YourApp /></AuthProvider>;
}`
  },
  {
    id: 'vue',
    label: 'Vue.js',
    description: 'Using oidc-client-ts',
    code: (supabaseUrl) => `import { UserManager } from "oidc-client-ts";

const userManager = new UserManager({
  authority: "${supabaseUrl}/auth/v1",
  client_id: "YOUR_CLIENT_ID",
  redirect_uri: "http://localhost:5173/callback",
  response_type: "code",
  scope: "openid profile email",
});

// Trigger login
userManager.signinRedirect();

// Handle callback
userManager.signinCallback().then((user) => {
  console.log("Logged in:", user);
});`
  },
  {
    id: 'ios',
    label: 'iOS (Swift)',
    description: 'Using AppAuth-iOS',
    code: (supabaseUrl) => `import AppAuth

let issuer = URL(string: "${supabaseUrl}/auth/v1")!
let configuration = OIDServiceConfiguration(discoveryDocument: OIDServiceDiscovery(json: ...))

let request = OIDAuthorizationRequest(
    configuration: configuration,
    clientId: "YOUR_CLIENT_ID",
    scopes: [OIDScopeOpenID, OIDScopeProfile, OIDScopeEmail],
    redirectURL: URL(string: "com.yourapp:/callback")!,
    responseType: OIDResponseTypeCode,
    additionalParameters: nil
)

// Performs the auth flow...`
  },
  {
    id: 'android',
    label: 'Android (Kotlin)',
    description: 'Using AppAuth-Android',
    code: (supabaseUrl) => `val serviceConfig = AuthorizationServiceConfiguration(
    Uri.parse("${supabaseUrl}/auth/v1/authorize"), // Authorization endpoint
    Uri.parse("${supabaseUrl}/auth/v1/token")      // Token endpoint
)

val authRequest = AuthorizationRequest.Builder(
    serviceConfig,
    "YOUR_CLIENT_ID",
    ResponseTypeValues.CODE,
    Uri.parse("com.yourapp://callback")
).setScopes("openid", "profile", "email")
 .build()`
  },
  {
    id: 'flutter',
    label: 'Flutter',
    description: 'Using flutter_appauth',
    code: (supabaseUrl) => `import 'package:flutter_appauth/flutter_appauth.dart';

final FlutterAppAuth appAuth = FlutterAppAuth();

final AuthorizationTokenResponse? result = await appAuth.authorizeAndExchangeCode(
  AuthorizationTokenRequest(
    'YOUR_CLIENT_ID',
    'com.yourapp://callback',
    issuer: '${supabaseUrl}/auth/v1',
    scopes: ['openid', 'profile', 'email'],
    serviceConfiguration: AuthorizationServiceConfiguration(
      authorizationEndpoint: '${supabaseUrl}/auth/v1/authorize',
      tokenEndpoint: '${supabaseUrl}/auth/v1/token',
    ),
  ),
);`
  },
  {
    id: 'go',
    label: 'Go',
    description: 'Using coreos/go-oidc',
    code: (supabaseUrl) => `provider, err := oidc.NewProvider(ctx, "${supabaseUrl}/auth/v1")
if err != nil {
    // handle error
}

oauth2Config := oauth2.Config{
    ClientID:     "YOUR_CLIENT_ID",
    ClientSecret: "YOUR_CLIENT_SECRET",
    RedirectURL:  "http://localhost:8080/callback",
    Endpoint:     provider.Endpoint(),
    Scopes:       []string{oidc.ScopeOpenID, "profile", "email"},
}`
  },
  {
    id: 'python',
    label: 'Python',
    description: 'Using Authlib',
    code: (supabaseUrl) => `oauth.register(
    name='supabase',
    client_id='YOUR_CLIENT_ID',
    client_secret='YOUR_CLIENT_SECRET',
    server_metadata_url='${supabaseUrl}/auth/v1/.well-known/openid-configuration',
    client_kwargs={'scope': 'openid profile email'}
)`
  },
  {
    id: 'dotnet',
    label: '.NET',
    description: 'Using Microsoft.AspNetCore.Authentication.OpenIdConnect',
    code: (supabaseUrl) => `builder.Services.AddAuthentication(options =>
{
    options.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = OpenIdConnectDefaults.AuthenticationScheme;
})
.AddCookie()
.AddOpenIdConnect(options =>
{
    options.Authority = "${supabaseUrl}/auth/v1";
    options.ClientId = "YOUR_CLIENT_ID";
    options.ClientSecret = "YOUR_CLIENT_SECRET";
    options.ResponseType = "code";
    options.SaveTokens = true;
    options.Scope.Add("openid");
    options.Scope.Add("profile");
    options.Scope.Add("email");
});`
  }
]
