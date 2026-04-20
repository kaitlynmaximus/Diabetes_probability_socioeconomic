import React, { useMemo, useState } from "react";

export default function NhanesDiabetesSESUI() {
  const COEF = {
    intercept: -4.397,
    Age: 0.05209,
    Gender_bin: 0.41,
    Education_HighSchool: -0.4309,
    Education_College: -0.4616,
    HHIncomeMid: -0.000006229,
    HomeOwn_Rent: 0.3186,
    HomeOwn_Other: 0.3625,
    Employment_Employed: -0.1792,
  };

  const [age, setAge] = useState(45);
  const [gender, setGender] = useState("female");
  const [education, setEducation] = useState("College");
  const [incomeMid, setIncomeMid] = useState(50000);
  const [homeOwn, setHomeOwn] = useState("Own");
  const [employmentStatus, setEmploymentStatus] = useState("Employed");

  const eta = useMemo(() => {
    const ageNum = Number(age);
    const incomeNum = Number(incomeMid);

    if (![ageNum, incomeNum].every(Number.isFinite)) return null;

    let z = COEF.intercept;
    z += COEF.Age * ageNum;
    z += COEF.Gender_bin * (gender === "male" ? 1 : 0);

    if (education === "HighSchool") z += COEF.Education_HighSchool;
    if (education === "College") z += COEF.Education_College;

    z += COEF.HHIncomeMid * incomeNum;

    if (homeOwn === "Rent") z += COEF.HomeOwn_Rent;
    if (homeOwn === "Other") z += COEF.HomeOwn_Other;

    if (employmentStatus === "Employed") z += COEF.Employment_Employed;

    return z;
  }, [age, gender, education, incomeMid, homeOwn, employmentStatus]);

  const probability = useMemo(() => {
    if (eta === null) return null;
    return 1 / (1 + Math.exp(-eta));
  }, [eta]);

  const probabilityPct =
    probability === null ? "--" : `${(probability * 100).toFixed(1)}%`;

  const riskLabel =
    probability === null
      ? "Incomplete"
      : probability < 0.1
      ? "Low"
      : probability < 0.25
      ? "Elevated"
      : probability < 0.5
      ? "Moderate"
      : "High";

  const oddsRatioAge = Math.exp(COEF.Age).toFixed(3);
  const oddsRatioMale = Math.exp(COEF.Gender_bin).toFixed(3);
  const oddsRatioRent = Math.exp(COEF.HomeOwn_Rent).toFixed(3);

  const selectedInputs = [
    ["Age", String(age)],
    ["Gender", gender === "male" ? "Male" : "Female"],
    ["Education", education],
    ["Household income midpoint", `$${Number(incomeMid).toLocaleString()}`],
    ["Home ownership", homeOwn],
    ["Employment status", employmentStatus],
  ];

  const referenceGroups = [
    ["Gender", "Female"],
    ["Education", "8thGrade"],
    ["Home ownership", "Own"],
    ["Employment status", "Unemployed"],
  ];

  const Field = ({ label, children, help }) => (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="text-sm font-semibold text-slate-800">{label}</div>
      <div className="mt-2">{children}</div>
      {help ? <div className="mt-2 text-xs text-slate-500">{help}</div> : null}
    </div>
  );

  const inputClass =
    "w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500";
  const selectClass = inputClass;

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Diabetes Probability Calculator — SES Model
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-600">
            This version uses the socioeconomic-focused logistic regression
            model based on age, gender, education, household income midpoint,
            home ownership, and employment status.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Age (years)">
                <input
                  className={inputClass}
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                />
              </Field>

              <Field label="Gender">
                <select
                  className={selectClass}
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                >
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                </select>
              </Field>

              <Field label="Education">
                <select
                  className={selectClass}
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                >
                  <option value="8thGrade">8thGrade</option>
                  <option value="HighSchool">HighSchool</option>
                  <option value="College">College</option>
                </select>
              </Field>

              <Field
                label="Household income midpoint ($)"
                help="Use the numeric midpoint value for the household income category."
              >
                <input
                  className={inputClass}
                  type="number"
                  value={incomeMid}
                  onChange={(e) => setIncomeMid(e.target.value)}
                />
              </Field>

              <Field label="Home ownership">
                <select
                  className={selectClass}
                  value={homeOwn}
                  onChange={(e) => setHomeOwn(e.target.value)}
                >
                  <option value="Own">Own</option>
                  <option value="Rent">Rent</option>
                  <option value="Other">Other</option>
                </select>
              </Field>

              <Field label="Employment status">
                <select
                  className={selectClass}
                  value={employmentStatus}
                  onChange={(e) => setEmploymentStatus(e.target.value)}
                >
                  <option value="Unemployed">Unemployed</option>
                  <option value="Employed">Employed</option>
                </select>
              </Field>
            </div>
          </div>

          <div>
            <div className="sticky top-6 rounded-3xl bg-slate-900 p-6 text-white shadow-xl">
              <div className="text-sm uppercase tracking-[0.2em] text-slate-300">
                Predicted output
              </div>
              <div className="mt-4 text-5xl font-bold">{probabilityPct}</div>
              <div className="mt-2 inline-flex rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-slate-100">
                {riskLabel} probability
              </div>

              <div className="mt-6 space-y-4 border-t border-white/10 pt-6 text-sm text-slate-200">
                <div className="flex items-center justify-between gap-4">
                  <span>Linear predictor</span>
                  <span className="font-semibold text-white">
                    {eta === null ? "--" : eta.toFixed(3)}
                  </span>
                </div>
                <p className="rounded-2xl bg-white/5 p-4 text-xs leading-5 text-slate-300">
                  This score comes directly from a SES-focused fitted logistic
                  regression coefficients. It is a model-based estimate from
                  your NHANES training sample, not a medical diagnosis.
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <h2 className="text-xl font-semibold text-slate-900">
                How this was calculated
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                The calculator uses a fitted logistic regression model. Each
                selected category adds its corresponding coefficient relative to
                a reference group, and the final linear predictor is converted
                into a probability with the logistic function.
              </p>

              <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-2">
                <div className="rounded-2xl border bg-slate-50 p-4">
                  <div className="text-sm font-semibold text-slate-800">
                    Selected inputs
                  </div>
                  <div className="mt-3 space-y-2 text-sm text-slate-700">
                    {selectedInputs.map(([label, value]) => (
                      <div
                        key={label}
                        className="flex items-center justify-between gap-4"
                      >
                        <span>{label}</span>
                        <span className="font-medium text-slate-900">
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border bg-slate-50 p-4">
                  <div className="text-sm font-semibold text-slate-800">
                    Reference groups in the model
                  </div>
                  <div className="mt-3 space-y-2 text-sm text-slate-700">
                    {referenceGroups.map(([label, value]) => (
                      <div
                        key={label}
                        className="flex items-center justify-between gap-4"
                      >
                        <span>{label}</span>
                        <span className="font-medium text-slate-900">
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border bg-slate-50 p-4 text-sm text-slate-700">
                <div className="font-semibold text-slate-800">
                  Quick model interpretation
                </div>
                <p className="mt-2 leading-6">
                  In this SES-focused model, each 1-year increase in age
                  multiplies the odds of diabetes by{" "}
                  <span className="font-semibold text-slate-900">
                    {oddsRatioAge}
                  </span>
                  , male gender multiplies the odds by{" "}
                  <span className="font-semibold text-slate-900">
                    {oddsRatioMale}
                  </span>
                  , and renting rather than owning multiplies the odds by{" "}
                  <span className="font-semibold text-slate-900">
                    {oddsRatioRent}
                  </span>
                  , holding the other predictors constant.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
